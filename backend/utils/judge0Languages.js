// backend/utils/judge0Languages.js
const axios = require('axios');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || process.env.RAPIDAPI_KEY || null;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

let catalog = null;

async function loadJudge0Languages() {
  if (catalog) return catalog;

  const url = `${JUDGE0_URL}/languages`;
  const headers = {};
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = JUDGE0_HOST;
  }
  const { data } = await axios.get(url, { headers, timeout: 10000 });
  catalog = Array.isArray(data) ? data : [];
  // Log a small map to help you inspect
  console.log('Judge0 languages:', catalog.slice(0, 8));
  return catalog;
}

function findIdByName(names) {
  if (!catalog) return null;
  const needles = Array.isArray(names) ? names : [names];
  // normalize needles
  const N = needles.map(s => String(s).toLowerCase());
  for (const lang of catalog) {
    const name = String(lang.name || '').toLowerCase();
    if (N.some(n => name.includes(n))) return lang.id;
  }
  return null;
}

// Env overrides if you want to force IDs
function envOverride(key) {
  const v = process.env[key];
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

// Resolve known language names your app uses → Judge0 id
async function resolveLanguageId(langName) {
  const name = String(langName || '').toLowerCase().trim();

  await loadJudge0Languages();

  // Optional env overrides, e.g., JUDGE0_ID_JS=63
  const overrides = {
    javascript: envOverride('JUDGE0_ID_JS'),
    typescript: envOverride('JUDGE0_ID_TS'),
    python: envOverride('JUDGE0_ID_PY'),
    java: envOverride('JUDGE0_ID_JAVA'),
    'c++': envOverride('JUDGE0_ID_CPP'),
    cpp: envOverride('JUDGE0_ID_CPP'),
    c: envOverride('JUDGE0_ID_C'),
    'c#': envOverride('JUDGE0_ID_CS'),
    csharp: envOverride('JUDGE0_ID_CS'),
    go: envOverride('JUDGE0_ID_GO'),
    rust: envOverride('JUDGE0_ID_RUST')
  };

  if (overrides[name]) return overrides[name];

  // Heuristic matching: look for key substrings
  switch (name) {
    case 'javascript':
      return findIdByName(['javascript', 'node.js']) ?? 63;
    case 'typescript':
      return findIdByName(['typescript']) ?? 74;
    case 'python':
    case 'python3':
      return findIdByName(['python (3', 'python3', 'python 3']) ?? 71;
    case 'java':
      return findIdByName(['java (openjdk', 'java ']) ?? 62;
    case 'c++':
    case 'cpp':
      return findIdByName(['c++', 'gcc', 'clang++']) ?? 54;
    case 'c':
      return findIdByName(['c (gcc', 'c ']) ?? 50;
    case 'c#':
    case 'csharp':
      return findIdByName(['c#', 'mono', 'dotnet']) ?? 51;
    case 'go':
      return findIdByName(['go (', 'golang']) ?? 60;
    case 'rust':
      return findIdByName(['rust (']) ?? 73;
    default:
      // As a last resort, try a direct contains
      return findIdByName([name]);
  }
}

module.exports = { loadJudge0Languages, resolveLanguageId };