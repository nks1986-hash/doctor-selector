// server.js
// -------------------------------------------------------------
// Express server that exposes a single /api/triage endpoint and
// serves the static chatbot UI from /public.
// -------------------------------------------------------------

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const { nextTriageTurn, DEFAULT_SPECIALTY } = require('./api');
const { getDoctorsForSpecialty } = require('./doctors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware --------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '16kb' })); // small payload; symptoms are short
app.use(express.static(path.join(__dirname, 'public')));

// --- Lightweight request log (optional analytics) ---------------
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'queries.log');
function logQuery(symptoms, specialty) {
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

// Health check, handy for deployments.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/**
 * POST /api/triage
 * body: {
 *   messages: Array<{ role: 'user'|'assistant', content: string }>
 * }
 * The full conversation so far is sent on every call. The assistant
 * messages should be the raw JSON directives previously returned by
 * this endpoint (the frontend stores them verbatim).
 *
 * res (asking a follow-up):
 *   { action: 'ask', question: string, assistantMessage: string }
 * res (final recommendation):
 *   { action: 'finalize', specialty, message, doctors, assistantMessage }
 */
app.post('/api/triage', async (req, res) => {
  const rawMessages = Array.isArray(req.body?.messages) ? req.body.messages : null;

  // Backward-compat: accept { symptoms: "..." } as a single user turn.
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
      .slice(-20) // hard cap to keep prompts small
      .map((m) => ({ role: m.role, content: m.content.toString() }));
  } else {
    const symptoms = (req.body?.symptoms || '').toString().trim();
    history = symptoms ? [{ role: 'user', content: symptoms }] : [];
  }

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return res.status(400).json({
      error: 'Please describe your symptoms.',
    });
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

    // finalize
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

// SPA-style fallback: serve index.html for unknown GETs.
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Doctor Selector running at http://localhost:${PORT}`);
});
