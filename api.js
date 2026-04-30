// api.js
// -------------------------------------------------------------
// Thin wrapper around the OpenAI Chat Completions API.
// Keeps all model-specific logic in one place so server.js stays
// focused on HTTP concerns.
// -------------------------------------------------------------

const OpenAI = require('openai');

// A whitelist of specialties we are willing to surface to the user.
// If the model returns something outside this list (or nothing useful)
// we fall back to "General Physician".
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

// Lazily construct the client so missing env vars surface a clean error
// at request time rather than at module load time.
let _client = null;
function getClient() {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to your .env file.');
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

/**
 * Build the structured prompt sent to ChatGPT.
 * Keeping this as a pure function makes it trivial to unit-test.
 */
function buildPrompt(symptoms) {
  return (
    `Patient symptoms: ${symptoms}\n` +
    `Task: Based on these symptoms, identify the most appropriate medical ` +
    `specialty (e.g., cardiologist, dermatologist, neurologist, general ` +
    `physician, etc.).\n` +
    `Return only the doctor category.`
  );
}

/**
 * Normalize whatever the model returned into one of ALLOWED_SPECIALTIES.
 * Returns DEFAULT_SPECIALTY when nothing sensible can be extracted.
 */
function normalizeSpecialty(rawText) {
  if (!rawText || typeof rawText !== 'string') return DEFAULT_SPECIALTY;

  // Strip punctuation, articles, and trailing words like "doctor".
  const cleaned = rawText
    .replace(/[`*_."'\n\r]/g, ' ')
    .replace(/\b(a|an|the|see|consult|visit|doctor|specialist)\b/gi, ' ')
    .trim()
    .toLowerCase();

  if (!cleaned) return DEFAULT_SPECIALTY;

  // Try direct match against the whitelist.
  for (const specialty of ALLOWED_SPECIALTIES) {
    if (cleaned.includes(specialty.toLowerCase())) return specialty;
  }

  // Common synonyms / loose matches.
  const synonyms = {
    heart: 'Cardiologist',
    skin: 'Dermatologist',
    brain: 'Neurologist',
    nerve: 'Neurologist',
    stomach: 'Gastroenterologist',
    digest: 'Gastroenterologist',
    lung: 'Pulmonologist',
    breath: 'Pulmonologist',
    bone: 'Orthopedist',
    joint: 'Orthopedist',
    diabet: 'Endocrinologist',
    hormone: 'Endocrinologist',
    eye: 'Ophthalmologist',
    ear: 'ENT Specialist',
    nose: 'ENT Specialist',
    throat: 'ENT Specialist',
    mental: 'Psychiatrist',
    anxiet: 'Psychiatrist',
    depress: 'Psychiatrist',
    urin: 'Urologist',
    kidney: 'Nephrologist',
    pregnan: 'Gynecologist',
    child: 'Pediatrician',
    cancer: 'Oncologist',
    tumor: 'Oncologist',
    arthrit: 'Rheumatologist',
    allerg: 'Allergist',
    tooth: 'Dentist',
    dental: 'Dentist',
  };
  for (const key of Object.keys(synonyms)) {
    if (cleaned.includes(key)) return synonyms[key];
  }

  return DEFAULT_SPECIALTY;
}

/**
 * Ask ChatGPT which specialty fits the given symptoms.
 * Always resolves to a string from ALLOWED_SPECIALTIES.
 */
async function getDoctorSpecialty(symptoms) {
  const client = getClient();
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const prompt = buildPrompt(symptoms);

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 20,
    messages: [
      {
        role: 'system',
        content:
          'You are a medical triage assistant. Reply with ONLY the name ' +
          'of the most appropriate medical specialty, no extra words.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion?.choices?.[0]?.message?.content ?? '';
  return normalizeSpecialty(raw);
}

module.exports = {
  getDoctorSpecialty,
  normalizeSpecialty,
  buildPrompt,
  ALLOWED_SPECIALTIES,
  DEFAULT_SPECIALTY,
};
