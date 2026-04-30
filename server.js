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

const { getDoctorSpecialty, DEFAULT_SPECIALTY } = require('./api');

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
 * body: { symptoms: string }
 * res:  { specialty: string, message: string }
 */
app.post('/api/triage', async (req, res) => {
  const symptoms = (req.body?.symptoms || '').toString().trim();

  if (!symptoms) {
    return res.status(400).json({
      error: 'Please describe your symptoms.',
    });
  }

  try {
    const specialty = await getDoctorSpecialty(symptoms);
    logQuery(symptoms, specialty);
    return res.json({
      specialty,
      message: `You should consult a ${specialty}.`,
    });
  } catch (err) {
    // Never leak internals; fall back to a safe default.
    console.error('[triage] OpenAI error:', err.message);
    return res.status(200).json({
      specialty: DEFAULT_SPECIALTY,
      message:
        `I couldn't analyze that confidently right now. ` +
        `As a safe default, please consult a ${DEFAULT_SPECIALTY}.`,
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
