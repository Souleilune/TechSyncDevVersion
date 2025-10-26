// backend/utils/codeEvaluator.js
// Forgiving checker: don't send expected_output to Judge0; compare JSON/text in backend.
// Provides detailed per-test diffs for UI.

const axios = require('axios');
const { resolveLanguageId } = require('./judge0Languages');

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || process.env.RAPIDAPI_KEY || null;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
const JSON_NUM_TOLERANCE = Number(process.env.JUDGE0_JSON_TOLERANCE || '0'); // e.g. 0.000001
const DEBUG = process.env.JUDGE0_DEBUG === '1';

function log(...args) { if (DEBUG) console.log('[Judge0]', ...args); }

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (JUDGE0_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_KEY;
    headers['X-RapidAPI-Host'] = JUDGE0_HOST;
  }
  return headers;
}

// -------- utils --------
function safeStringify(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return String(value); }
  }
  return String(value);
}

function tryParseJSON(s) {
  try {
    const v = JSON.parse(s);
    return { ok: true, value: v };
  } catch {
    return { ok: false, value: null };
  }
}

function deepEqualJSON(a, b, tol = 0) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'number') {
    if (tol > 0) return Math.abs(a - b) <= tol;
    return a === b;
  }
  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqualJSON(a[i], b[i], tol)) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    for (let i = 0; i < ak.length; i++) {
      if (ak[i] !== bk[i]) return false;
      if (!deepEqualJSON(a[ak[i]], b[bk[i]], tol)) return false;
    }
    return true;
  }
  return a === b;
}

function diffJSON(exp, act, tol = 0, path = '$') {
  const result = {
    missingKeys: [], // keys in expected but not in actual
    extraKeys: [],   // keys in actual but not in expected
    mismatches: []   // { path, expected, actual, delta? }
  };

  const pushMismatch = (p, e, a) => {
    const item = { path: p, expected: e, actual: a };
    if (typeof e === 'number' && typeof a === 'number') {
      item.delta = a - e;
    }
    result.mismatches.push(item);
  };

  // primitive equality (with tolerance on numbers)
  const equal = (x, y) => deepEqualJSON(x, y, tol);

  // arrays
  if (Array.isArray(exp) && Array.isArray(act)) {
    const n = Math.min(exp.length, act.length);
    for (let i = 0; i < n; i++) {
      const sub = diffJSON(exp[i], act[i], tol, `${path}[${i}]`);
      result.missingKeys.push(...sub.missingKeys);
      result.extraKeys.push(...sub.extraKeys);
      result.mismatches.push(...sub.mismatches);
    }
    if (act.length > exp.length) {
      for (let i = exp.length; i < act.length; i++) {
        result.extraKeys.push(`${path}[${i}]`);
      }
    }
    if (exp.length > act.length) {
      for (let i = act.length; i < exp.length; i++) {
        result.missingKeys.push(`${path}[${i}]`);
      }
    }
    return result;
  }

  // objects
  if (exp && act && typeof exp === 'object' && typeof act === 'object' && !Array.isArray(exp) && !Array.isArray(act)) {
    const expKeys = Object.keys(exp);
    const actKeys = Object.keys(act);
    for (const k of expKeys) {
      if (!(k in act)) {
        result.missingKeys.push(`${path}.${k}`);
      }
    }
    for (const k of actKeys) {
      if (!(k in exp)) {
        result.extraKeys.push(`${path}.${k}`);
      }
    }
    // common keys
    for (const k of expKeys) {
      if (k in act) {
        const sub = diffJSON(exp[k], act[k], tol, `${path}.${k}`);
        result.missingKeys.push(...sub.missingKeys);
        result.extraKeys.push(...sub.extraKeys);
        result.mismatches.push(...sub.mismatches);
      }
    }
    return result;
  }

  // primitives
  if (!equal(exp, act)) {
    pushMismatch(path, exp, act);
  }
  return result;
}

function firstDiffIndex(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i;
  }
  return n === a.length && n === b.length ? -1 : n;
}

function compareOutputs(expectedRaw, actualRaw, tol = JSON_NUM_TOLERANCE) {
  const expStr = safeStringify(expectedRaw).trim();
  const actStr = safeStringify(actualRaw).trim();

  const expJson = tryParseJSON(expStr);
  const actJson = tryParseJSON(actStr);

  if (expJson.ok && actJson.ok) {
    const diff = diffJSON(expJson.value, actJson.value, tol, '$');
    const ok = diff.mismatches.length === 0 && diff.missingKeys.length === 0 && diff.extraKeys.length === 0;
    return { ok, mode: 'json', expected: expStr, actual: actStr, jsonDiff: diff };
  }

  const idx = firstDiffIndex(expStr, actStr);
  const ok = idx === -1;
  // small previews around the first difference
  const previewSpan = 40;
  const expPrev = expStr.slice(Math.max(0, idx - previewSpan), Math.min(expStr.length, idx + previewSpan));
  const actPrev = actStr.slice(Math.max(0, idx - previewSpan), Math.min(actStr.length, idx + previewSpan));

  return { ok, mode: 'text', expected: expStr, actual: actStr, firstDiffIndex: idx, expectedPreview: expPrev, actualPreview: actPrev };
}

// -------- Judge0 interaction (no expected_output) --------
async function submitExecution({ sourceCode, languageId, stdin = '', timeLimitMs = 5000, memoryLimitMb = 256 }) {
  try {
    const payload = {
      source_code: Buffer.from(safeStringify(sourceCode)).toString('base64'),
      language_id: languageId,
      stdin: stdin ? Buffer.from(safeStringify(stdin)).toString('base64') : null,
      cpu_time_limit: Math.ceil(timeLimitMs / 1000),
      memory_limit: memoryLimitMb * 1024
    };
    const resp = await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
      payload,
      { headers: getHeaders(), timeout: 15000 }
    );
    if (!resp.data.token) throw new Error('No submission token received from Judge0');
    return resp.data.token;
  } catch (error) {
    log('Submission failed', error.response?.data || error.message);
    throw new Error(`Judge0 submission failed: ${error.message}`);
  }
}

async function getExecutionResult(token) {
  try {
    const maxAttempts = 30;
    let attempts = 0;
    while (attempts < maxAttempts) {
      const resp = await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`,
        { headers: getHeaders(), timeout: 10000 }
      );
      const d = resp.data;
      if (d.status?.id <= 2) { // queued/processing
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
        continue;
      }
      return {
        status: d.status,
        stdout: d.stdout ? Buffer.from(d.stdout, 'base64').toString() : '',
        stderr: d.stderr ? Buffer.from(d.stderr, 'base64').toString() : '',
        compile_output: d.compile_output ? Buffer.from(d.compile_output, 'base64').toString() : '',
        time: parseFloat(d.time) || 0,
        memory: parseInt(d.memory) || 0,
        exit_code: d.exit_code
      };
    }
    throw new Error('Execution timeout - Judge0 took too long to respond');
  } catch (error) {
    log('Get result failed', error.response?.data || error.message);
    throw new Error(`Failed to get Judge0 result: ${error.message}`);
  }
}

async function executeTestCase({ sourceCode, languageId, testCase, timeLimitMs = 5000, memoryLimitMb = 256 }) {
  try {
    const start = Date.now();

    const input = safeStringify(testCase.input || testCase.stdin || '');
    const expected = safeStringify(
      testCase.expected_output || testCase.output || testCase.expectedOutput || testCase.expected || ''
    );

    const token = await submitExecution({ sourceCode, languageId, stdin: input, timeLimitMs, memoryLimitMb });
    const res = await getExecutionResult(token);
    const end = Date.now();

    const errorStatusIds = new Set([5,6,7,8,9,10,11,12]); // TLE, CE, RE, etc.
    const actualTrim = (res.stdout || '').trim();
    let passed = false;
    let diffPayload = null;

    if (!errorStatusIds.has(res.status?.id)) {
      const cmp = compareOutputs(expected, actualTrim, JSON_NUM_TOLERANCE);
      passed = cmp.ok;
      if (cmp.mode === 'json') {
        diffPayload = {
          mode: 'json',
          missingKeys: cmp.jsonDiff.missingKeys,
          extraKeys: cmp.jsonDiff.extraKeys,
          mismatches: cmp.jsonDiff.mismatches
        };
      } else {
        diffPayload = {
          mode: 'text',
          firstDiffIndex: cmp.firstDiffIndex,
          expectedPreview: cmp.expected,
          actualPreview: cmp.actual
        };
      }
    } else {
      // compile/runtime error: keep diff null, present stderr/compile_output
      passed = false;
    }

    return {
      passed,
      input,
      expectedOutput: safeStringify(expected).trim(),
      actualOutput: actualTrim,
      executionTime: res.time * 1000,
      memoryUsage: res.memory,
      status: res.status,
      stderr: res.stderr,
      compileOutput: res.compile_output,
      wallTime: end - start,
      exitCode: res.exit_code,
      diff: diffPayload
    };
  } catch (error) {
    log('Test execution error', error.message);
    return {
      passed: false,
      input: safeStringify(testCase.input || testCase.stdin || ''),
      expectedOutput: safeStringify(testCase.expected || ''),
      actualOutput: '',
      executionTime: 0,
      memoryUsage: 0,
      status: { id: -1, description: 'Execution Error' },
      stderr: error.message,
      compileOutput: '',
      wallTime: 0,
      exitCode: -1,
      diff: { mode: 'text', firstDiffIndex: -1, expectedPreview: '', actualPreview: '' },
      error: error.message
    };
  }
}

// -------- test-cases helpers --------
function parseTestCases(testCasesData) {
  try {
    let t = testCasesData;
    if (typeof t === 'string') {
      try { t = JSON.parse(t); } catch { log('Failed to parse test cases JSON'); return []; }
    }
    if (Array.isArray(t)) return t;
    if (t && Array.isArray(t.tests)) return t.tests;
    if (t && typeof t === 'object') return [t];
    log('Unknown test case format:', typeof testCasesData);
    return [];
  } catch (error) {
    log('Error parsing test cases', error.message);
    return [];
  }
}

async function getExpectedSolution(challengeId) {
  try {
    if (!challengeId) return null;
    const supabase = require('../config/supabase');
    const { data: challenge, error } = await supabase
      .from('coding_challenges')
      .select('expected_solution, test_cases')
      .eq('id', challengeId)
      .single();
    if (error || !challenge) return null;
    return { expectedSolution: challenge.expected_solution, testCases: parseTestCases(challenge.test_cases) };
  } catch (error) {
    log('DB error getting expected solution', error.message);
    return null;
  }
}

// -------- main runner --------
async function runTests({ sourceCode, languageName, testCases, challengeId = null, timeLimitMs = 5000, memoryLimitMb = 256 }) {
  log('Running tests for', languageName);
  const languageId = await resolveLanguageId(languageName);
  if (!languageId) throw new Error(`Unsupported language: ${languageName}`);

  let finalTestCases = parseTestCases(testCases);
  if (challengeId && (!finalTestCases || finalTestCases.length === 0)) {
    const db = await getExpectedSolution(challengeId);
    if (db?.testCases?.length) finalTestCases = db.testCases;
  }
  if (!finalTestCases || finalTestCases.length === 0) {
    throw new Error('No test cases available for this challenge');
  }

  const results = [];
  let totalTime = 0;
  let peakMem = 0;
  let passedCount = 0;

  const perTest = Math.max(1500, Math.min(10000, Math.floor(timeLimitMs)));

  for (let i = 0; i < finalTestCases.length; i++) {
    const r = await executeTestCase({ sourceCode, languageId, testCase: finalTestCases[i], timeLimitMs: perTest, memoryLimitMb });
    results.push({ testNumber: i + 1, ...r });
    totalTime += r.executionTime;
    peakMem = Math.max(peakMem, r.memoryUsage || 0);
    if (r.passed) passedCount += 1;
  }

  return {
    passedCount,
    totalCount: finalTestCases.length,
    totalTimeMs: totalTime,
    peakMemoryKb: peakMem,
    tests: results,
    language: languageName,
    languageId,
    allPassed: passedCount === finalTestCases.length,
    challengeId
  };
}

async function testJudge0Connection() {
  try {
    const resp = await axios.get(`${JUDGE0_URL}/languages`, { headers: getHeaders(), timeout: 10000 });
    return { success: true, languageCount: Array.isArray(resp.data) ? resp.data.length : 0 };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  runTests,
  executeTestCase,
  submitExecution,
  getExecutionResult,
  testJudge0Connection,
  parseTestCases,
  getExpectedSolution
};