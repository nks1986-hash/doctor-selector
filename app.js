// app.js
// -------------------------------------------------------------
// Express app factory. Used by:
//   - server.js            -> local `npm start` (listens on PORT)
//   - api/index.js         -> Vercel serverless entry (no listen)
// -------------------------------------------------------------

// Load .env only outside Vercel. On Vercel, env vars are injected
// directly from the project's Environment Variables settings.
if (!process.env.VERCEL) {
  require('dotenv').config();
}

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { nextTriageTurn, DEFAULT_SPECIALTY } = require('./api');
const { getDoctorsForSpecialty } = require('./doctors');

const app = express();

// --- Middleware --------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Lightweight query log (skipped on read-only FS like Vercel) -
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'queries.log');
const LOG_DISABLED = !!process.env.VERCEL; // serverless = read-only fs
function logQuery(symptoms, specialty) {
  if (LOG_DISABLED) return;
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    const line =
      JSON.stringify({
        ts: new Date().toISOString(),
        symptoms,
        specialty,
      }) + '\n';
    fs.appendFile(LOG_FILE, line, () => {});
  } catch {
    /* logging must never break the request path */
  }
}

// --- Routes ------------------------------------------------------

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/triage', async (req, res) => {
  const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : null;

  let history;
  if (rawMessages) {
    history = rawMessages
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim()
      )
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.toString() }));
  } else {
    const symptoms = (req.body?.symptoms || '').toString().trim();
    history = symptoms ? [{ role: 'user', content: symptoms }] : [];
  }

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Please describe your symptoms.' });
  }

  try {
    const result = await nextTriageTurn(history);
    const assistantMessage = JSON.stringify(result);

    if (result.action === 'ask') {
      return res.json({
        action: 'ask',
        question: result.question,
        assistantMessage,
      });
    }

    const specialty = result.specialty || DEFAULT_SPECIALTY;
    const doctors = getDoctorsForSpecialty(specialty);
    const lastUser = [...history].reverse().find((m) => m.role === 'user');
    logQuery(lastUser ? lastUser.content : '', specialty);
    return res.json({
      action: 'finalize',
      specialty,
      message: `Based on what you've shared, you should consult a ${specialty}.`,
      doctors,
      assistantMessage,
    });
  } catch (err) {
    console.error('[triage] OpenAI error:', err.message);
    const fallback = { action: 'finalize', specialty: DEFAULT_SPECIALTY };
    return res.status(200).json({
      action: 'finalize',
      specialty: DEFAULT_SPECIALTY,
      message:
        `I couldn't analyze that confidently right now. ` +
        `As a safe default, please consult a ${DEFAULT_SPECIALTY}.`,
      doctors: getDoctorsForSpecialty(DEFAULT_SPECIALTY),
      assistantMessage: JSON.stringify(fallback),
      degraded: true,
    });
  }
});

// SPA-style fallback for unknown GETs.
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
