// api.js
// -------------------------------------------------------------
// Multi-turn triage assistant powered by OpenAI Chat Completions.
//
// The model decides on its own whether to:
//   1. Ask the patient a clarifying follow-up question, OR
//   2. Finalize the recommended medical specialty.
//
// We signal "done" by asking the model to emit a JSON object:
//     { "action": "ask",     "question": "..." }
//     { "action": "finalize","specialty": "Cardiologist" }
//
// Anything else / parse failure falls back to General Physician.
// -------------------------------------------------------------

const OpenAI = require('openai');

// Whitelist of specialties we surface to the user. Anything outside
// this list is collapsed into "General Physician".
const ALLOWED_SPECIALTIES = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Gastroenterologist',
  'Pulmonologist',
  'Orthopedist',
  'Endocrinologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Psychiatrist',
  'Urologist',
  'Gynecologist',
  'Pediatrician',
  'Oncologist',
  'Nephrologist',
  'Rheumatologist',
  'Allergist',
  'Dentist',
  'General Physician',
];

const DEFAULT_SPECIALTY = 'General Physician';
const MAX_FOLLOWUPS = 3;

const SYSTEM_PROMPT = `You are a medical triage assistant. Your job is to suggest the most appropriate medical specialty for the patient.

You may ask the patient up to ${MAX_FOLLOWUPS} short clarifying questions (one at a time) about their symptoms — for example: duration, severity, location, related symptoms, age group, or relevant history — BEFORE finalizing.

When you still need more information, respond with EXACTLY this JSON (no prose, no markdown):
{"action":"ask","question":"<one short question>"}

When you have enough information, respond with EXACTLY this JSON (no prose, no markdown):
{"action":"finalize","specialty":"<one specialty from the allowed list>"}

Allowed specialties (use the exact spelling): ${ALLOWED_SPECIALTIES.join(', ')}.

Rules:
- Always reply with a SINGLE JSON object and nothing else.
- Ask at most ${MAX_FOLLOWUPS} follow-up questions total across the whole conversation.
- After ${MAX_FOLLOWUPS} follow-ups (or sooner if confident), you MUST finalize.
- If the symptoms are vague or non-medical, finalize with "General Physician".`;

let _client = null;
function getClient() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const where = process.env.VERCEL
      ? 'the Vercel project Environment Variables (Settings → Environment Variables)'
      : 'your local .env file';
    throw new Error(`OPENAI_API_KEY is not set. Add it to ${where}.`);
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

function normalizeSpecialty(rawText) {
  if (!rawText || typeof rawText !== 'string') return DEFAULT_SPECIALTY;
  const cleaned = rawText.trim().toLowerCase();
  if (!cleaned) return DEFAULT_SPECIALTY;
  for (const specialty of ALLOWED_SPECIALTIES) {
    if (cleaned.includes(specialty.toLowerCase())) return specialty;
  }
  return DEFAULT_SPECIALTY;
}

/**
 * Try to parse the model output as our control JSON.
 * Returns one of:
 *   { action: 'ask', question: string }
 *   { action: 'finalize', specialty: string }   // specialty normalized
 *   null   // unparseable
 */
function parseModelDirective(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let obj;
  try {
    obj = JSON.parse(match[0]);
  } catch {
    return null;
  }
  if (
    obj &&
    obj.action === 'ask' &&
    typeof obj.question === 'string' &&
    obj.question.trim()
  ) {
    return { action: 'ask', question: obj.question.trim() };
  }
  if (obj && obj.action === 'finalize') {
    return { action: 'finalize', specialty: normalizeSpecialty(obj.specialty) };
  }
  return null;
}

/** How many follow-up questions the assistant has already asked. */
function countAssistantQuestions(history) {
  if (!Array.isArray(history)) return 0;
  let n = 0;
  for (const m of history) {
    if (m && m.role === 'assistant' && typeof m.content === 'string') {
      const parsed = parseModelDirective(m.content);
      if (parsed && parsed.action === 'ask') n++;
    }
  }
  return n;
}

/**
 * Drive one turn of the triage conversation.
 * @param {Array<{role:'user'|'assistant', content:string}>} history
 */
async function nextTriageTurn(history) {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const askedSoFar = countAssistantQuestions(history);
  const mustFinalize = askedSoFar >= MAX_FOLLOWUPS;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ];

  if (mustFinalize) {
    messages.push({
      role: 'system',
      content:
        'You have already asked the maximum number of follow-up questions. ' +
        'You MUST now respond with a finalize JSON object.',
    });
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 120,
    messages,
    response_format: { type: 'json_object' },
  });

  const raw = completion?.choices?.[0]?.message?.content ?? '';
  const parsed = parseModelDirective(raw);

  if (!parsed) {
    return { action: 'finalize', specialty: DEFAULT_SPECIALTY };
  }
  if (parsed.action === 'ask' && mustFinalize) {
    return { action: 'finalize', specialty: DEFAULT_SPECIALTY };
  }
  return parsed;
}

module.exports = {
  nextTriageTurn,
  parseModelDirective,
  normalizeSpecialty,
  countAssistantQuestions,
  ALLOWED_SPECIALTIES,
  DEFAULT_SPECIALTY,
  MAX_FOLLOWUPS,
};
