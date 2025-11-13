import React from 'react';
import { FileInput, FileOutput, AlertCircle } from 'lucide-react';
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

  const box = { 
    marginTop: 16, 
    padding: 16, 
    border: '2px solid rgba(59, 130, 246, 0.3)', 
    borderRadius: 12, 
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
  };
  
  const title = { 
    fontWeight: 700, 
    margin: '0 0 8px 0', 
    color: '#e2e8f0',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
  
  const note = { 
    fontSize: 13, 
    color: '#94a3b8', 
    margin: '4px 0' 
  };
  
  const mono = { 
    fontFamily: 'Monaco, Consolas, monospace', 
    fontSize: 13, 
    whiteSpace: 'pre-wrap', 
    background: 'rgba(0, 0, 0, 0.4)', 
    border: '1px solid rgba(255, 255, 255, 0.15)', 
    borderRadius: 8, 
    padding: 12, 
    marginTop: 8,
    color: '#e2e8f0',
    overflowX: 'auto'
  };

  const sectionTitle = {
    marginTop: 12,
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: 15,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  return (
    <div style={box}>
      <div style={title}>
        <FileInput size={18} />
        I/O Requirements
      </div>
      <div style={note}>Your program is executed once per test case. It should:</div>
      <ul style={{ margin: '6px 0 12px 18px', color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
        <li>Read input from STDIN.</li>
        {isJsonOutput
          ? <li>Print exactly one JSON object to STDOUT (no extra logs).</li>
          : <li>Print exactly one line to STDOUT matching the expected output.</li>
        }
        {forgiving && isJsonOutput && <li>JSON whitespace and key order are ignored by the checker.</li>}
        {forgiving && isJsonOutput && numericToleranceHint && (
          <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} />
            Numeric values may allow a small tolerance.
          </li>
        )}
      </ul>

      <div style={sectionTitle}>
        <FileInput size={16} />
        Example input (stdin)
      </div>
      <pre style={mono}>{inputExample}</pre>

      <div style={sectionTitle}>
        <FileOutput size={16} />
        Expected output {isJsonOutput ? 'schema' : 'format'}
      </div>
      <pre style={mono}>{isJsonOutput && expectedKeys.length 
        ? `{ ${expectedKeys.map(k => `"${k}": <value>`).join(', ')} }` 
        : expectedStr}
      </pre>
    </div>
  );
}