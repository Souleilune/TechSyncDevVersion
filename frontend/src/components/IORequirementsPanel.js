import React from 'react';
import LanguageTips from './ChallengeHints';

function normalizeTestCases(raw) {
  let t = raw;
  try { if (typeof t === 'string') t = JSON.parse(t); } catch {}
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
  } catch { return { ok: false, value: null }; }
}

export default function IORequirementsPanel({ rawTestCases, forgiving = true, numericToleranceHint = true, languageName = '' }) {
  const tests = normalizeTestCases(rawTestCases);
  if (!tests.length) return null;

  const first = tests[0];
  const inputExample = typeof first.input === 'string' ? first.input : JSON.stringify(first.input ?? '', null, 2);
  const expectedStr = typeof first.expected === 'string' ? first.expected : JSON.stringify(first.expected ?? '', null, 2);
  const expJson = tryParseJSON(first.expected ?? '');
  const isJsonOutput = expJson.ok;
  const expectedKeys = isJsonOutput ? Object.keys(expJson.value) : [];

  const box = { marginTop: 16, padding: 16, border: '1px solid #e9ecef', borderRadius: 8, background: '#fff' };
  const title = { fontWeight: 700, margin: '0 0 8px 0', color: '#333' };
  const note = { fontSize: 13, color: '#555', margin: '4px 0' };
  const mono = { fontFamily: 'Monaco, Consolas, monospace', fontSize: 13, whiteSpace: 'pre-wrap', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: 6, padding: 10, marginTop: 6 };

  return (
    <div style={box}>
      <div style={title}>📥 I/O Requirements</div>
      <div style={note}>Your program is executed once per test case. It should:</div>
      <ul style={{ margin: '6px 0 12px 18px', color: '#444', fontSize: 13 }}>
        <li>Read input from STDIN.</li>
        {isJsonOutput
          ? <li>Print exactly one JSON object to STDOUT (no extra logs).</li>
          : <li>Print exactly one line to STDOUT matching the expected output.</li>
        }
        {forgiving && isJsonOutput && <li>JSON whitespace and key order are ignored by the checker.</li>}
        {forgiving && isJsonOutput && numericToleranceHint && <li>Numeric values may allow a small tolerance.</li>}
      </ul>

      <div style={{ marginTop: 8, color: '#333', fontWeight: 600 }}>Example input (stdin)</div>
      <pre style={mono}>{inputExample}</pre>

      <div style={{ marginTop: 8, color: '#333', fontWeight: 600 }}>
        Expected output {isJsonOutput ? '(JSON object)' : ''}
      </div>
      <pre style={mono}>{expectedStr}</pre>

      {isJsonOutput && expectedKeys.length > 0 && (
        <>
          <div style={{ marginTop: 8, fontWeight: 600, color: '#333' }}>
            Required JSON keys: {expectedKeys.join(', ')}
          </div>
        </>
      )}

      {/* Language-specific tips/snippet */}
      <LanguageTips languageName={languageName} expectedKeys={expectedKeys} />
    </div>
  );
}