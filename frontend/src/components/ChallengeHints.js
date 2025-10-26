import React, { useMemo, useState } from 'react';

// Normalize test cases into an array of { input, expected }
function normalizeTestCases(raw) {
  let t = raw;
  try {
    if (typeof t === 'string') t = JSON.parse(t);
  } catch { /* ignore parse errors */ }
  if (Array.isArray(t)) return t;
  if (t && Array.isArray(t.tests)) return t.tests;
  if (t && typeof t === 'object') return [t];
  return [];
}

function tryParseJSON(s) {
  try {
    const v = typeof s === 'string' ? JSON.parse(s) : s;
    if (v && typeof v === 'object' && !Array.isArray(v)) return { ok: true, value: v };
    return { ok: false, value: null };
  } catch {
    return { ok: false, value: null };
  }
}

function Code({ children }) {
  return (
    <pre
      style={{
        fontFamily: 'Monaco, Consolas, monospace',
        fontSize: 13,
        whiteSpace: 'pre-wrap',
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: 6,
        padding: 10,
        marginTop: 6
      }}
    >
      {children}
    </pre>
  );
}

export default function ChallengeHints({
  rawTestCases,
  failedAttempts = 0,
  thresholds = { hint1: 2, hint2: 4, hint3: 6 }
}) {
  // Hooks first (before any conditional return)
  const tests = useMemo(() => normalizeTestCases(rawTestCases), [rawTestCases]);
  const [reveal1, setReveal1] = useState(false);
  const [reveal2, setReveal2] = useState(false);
  const [reveal3, setReveal3] = useState(false);

  const styles = {
    box: { marginTop: 16, padding: 16, border: '1px solid #e9ecef', borderRadius: 8, background: '#fff' },
    title: { fontWeight: 700, marginBottom: 8, color: '#333' },
    note: { fontSize: 13, color: '#555', margin: '4px 0' },
    btn: {
      padding: '6px 10px',
      borderRadius: 6,
      border: '1px solid #e1e1e1',
      cursor: 'pointer',
      background: '#f8f9fa',
      marginRight: 8,
      marginTop: 6
    }
  };

  // If no tests, still show the IO rules so the user knows the contract
  if (!tests.length) {
    return (
      <div style={styles.box}>
        <div style={styles.title}>📥 I/O Rules</div>
        <ul style={{ margin: '6px 0 12px 18px', color: '#444', fontSize: 13 }}>
          <li>Read input from STDIN (one test per run).</li>
          <li>Print exactly one JSON object to STDOUT (no extra logs or prompts).</li>
          <li>Whitespace and key order in JSON are ignored by the checker.</li>
          <li>Numeric values may be compared as integers if the challenge expects integers.</li>
        </ul>
        <div style={styles.note}>Examples are not available for this challenge.</div>
      </div>
    );
  }

  // Use first test as example (safe fallbacks)
  const first = tests[0] || {};
  const inputExample =
    typeof first.input === 'string'
      ? first.input
      : (first.input ? JSON.stringify(first.input, null, 2) : '(example unavailable)');

  const expectedStr =
    typeof first.expected === 'string'
      ? first.expected
      : (first.expected ? JSON.stringify(first.expected, null, 2) : '(example unavailable)');

  const expJson = tryParseJSON(first.expected ?? '');
  const isJsonOutput = expJson.ok;
  const expectedKeys = isJsonOutput ? Object.keys(expJson.value) : [];

  // Output schema with placeholders (no concrete values, no code)
  const schema =
    isJsonOutput && expectedKeys.length
      ? `{ ${expectedKeys.map(k => `"${k}": <number>`).join(', ')} }`
      : expectedStr;

  return (
    <div style={styles.box}>
      <div style={styles.title}>📥 I/O Rules</div>
      <ul style={{ margin: '6px 0 12px 18px', color: '#444', fontSize: 13 }}>
        <li>Read input from STDIN (one test per run).</li>
        <li>Print exactly one JSON object to STDOUT (no extra logs or prompts).</li>
        <li>Whitespace and key order in JSON are ignored by the checker.</li>
        <li>Numeric values may be compared as integers if the challenge expects integers.</li>
      </ul>

      <div style={{ marginTop: 8, color: '#333', fontWeight: 600 }}>Example input (stdin)</div>
      <Code>{inputExample}</Code>

      <div style={{ marginTop: 8, color: '#333', fontWeight: 600 }}>Expected output schema</div>
      <Code>{schema}</Code>

      {/* Hint stepper (gated, generic; not language-specific, no code) */}
      <div style={{ marginTop: 12 }}>
        <div style={styles.title}>💡 Hints</div>

        {/* Hint 1 */}
        <button
          style={styles.btn}
          onClick={() => setReveal1(v => !v)}
          disabled={failedAttempts < thresholds.hint1}
          title={failedAttempts < thresholds.hint1 ? `Unlocks after ${thresholds.hint1} failed attempts` : 'Toggle hint'}
        >
          {reveal1 ? 'Hide hint 1' : 'Show hint 1'}
        </button>
        {reveal1 && (
          <ul style={{ margin: '6px 0 12px 18px', color: '#444', fontSize: 13 }}>
            <li>Input is a JSON object with a key for the list (see the example).</li>
            <li>Make sure to handle an empty list safely (return zeros).</li>
          </ul>
        )}

        {/* Hint 2 */}
        <button
          style={styles.btn}
          onClick={() => setReveal2(v => !v)}
          disabled={failedAttempts < thresholds.hint2}
          title={failedAttempts < thresholds.hint2 ? `Unlocks after ${thresholds.hint2} failed attempts` : 'Toggle hint'}
        >
          {reveal2 ? 'Hide hint 2' : 'Show hint 2'}
        </button>
        {reveal2 && (
          <ul style={{ margin: '6px 0 12px 18px', color: '#444', fontSize: 13 }}>
            <li>Average is total sum divided by count; if integers are expected, use integer division or floor.</li>
            <li>Print a single JSON object that contains only the required keys (no extra keys/fields).</li>
          </ul>
        )}

        {/* Hint 3 */}
        <button
          style={styles.btn}
          onClick={() => setReveal3(v => !v)}
          disabled={failedAttempts < thresholds.hint3}
          title={failedAttempts < thresholds.hint3 ? `Unlocks after ${thresholds.hint3} failed attempts` : 'Toggle hint'}
        >
          {reveal3 ? 'Hide hint 3' : 'Show hint 3'}
        </button>
        {reveal3 && (
          <ul style={{ margin: '6px 0 0 18px', color: '#444', fontSize: 13 }}>
            <li>Don’t loop through multiple tests in your program—one run equals one test.</li>
            <li>Don’t print debug logs (e.g., “Test 1 -{'>'} …”). Only the JSON result should be printed.</li>
          </ul>
        )}
      </div>
    </div>
  );
}