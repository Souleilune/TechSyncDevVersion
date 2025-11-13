// frontend/src/components/ChallengeHints.js - DARK THEME VERSION WITH LUCIDE ICONS
import React, { useMemo, useState } from 'react';
import { FileCheck, Lock, Lightbulb, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

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
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
        color: '#e2e8f0',
        overflowX: 'auto'
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
  

  // FIXED: Better button styles with hover and disabled states
  const getButtonStyle = (isDisabled, isRevealed) => ({
    padding: '8px 16px',
    borderRadius: 8,
    border: isDisabled ? '2px solid rgba(100, 116, 139, 0.3)' : '2px solid rgba(59, 130, 246, 0.5)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    background: isDisabled 
      ? 'linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(71, 85, 105, 0.2))' 
      : isRevealed
        ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
        : 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    color: isDisabled ? '#9ca3af' : '#ffffff',
    fontWeight: 600,
    fontSize: 14,
    marginRight: 8,
    marginTop: 8,
    marginBottom: 8,
    transition: 'all 0.3s ease',
    boxShadow: isDisabled 
      ? 'none' 
      : isRevealed
        ? '0 2px 8px rgba(59, 130, 246, 0.3)'
        : '0 4px 12px rgba(59, 130, 246, 0.4)',
    opacity: isDisabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  });

  const styles = {
    box: { 
      marginTop: 16, 
      padding: 20, 
      border: '2px solid rgba(59, 130, 246, 0.3)', 
      borderRadius: 12, 
      background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
    },
    title: { 
      fontWeight: 700, 
      marginBottom: 12, 
      color: '#e2e8f0',
      fontSize: 18,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    note: { 
      fontSize: 13, 
      color: '#94a3b8', 
      margin: '8px 0',
      fontStyle: 'italic'
    },
    buttonContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: 12,
      marginBottom: 12
    },
    lockIcon: {
      fontSize: 12,
      opacity: 0.8
    }
  };

  // If no tests, still show the IO rules so the user knows the contract
  if (!tests.length) {
    return (
      <div style={styles.box}>
        <div style={styles.title}>
          <FileCheck size={18} />
          I/O Rules
        </div>
        <ul style={{ margin: '6px 0 12px 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
          <li>Read input from STDIN (one test per run).</li>
          <li>Print exactly one JSON object to STDOUT (no extra logs or prompts).</li>
          <li>Whitespace and key order in JSON are ignored by the checker.</li>
          <li>Numeric values may be compared as integers if the challenge expects integers.</li>
        </ul>
        <div style={styles.note}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
            Examples are not available for this challenge.
          </span>
        </div>
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
      <div style={styles.title}>
        <FileCheck size={18} />
        I/O Rules
      </div>
      <ul style={{ margin: '6px 0 12px 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
        <li>Read input from STDIN (one test per run).</li>
        <li>Print exactly one JSON object to STDOUT (no extra logs or prompts).</li>
        <li>Whitespace and key order in JSON are ignored by the checker.</li>
        <li>Numeric values may be compared as integers if the challenge expects integers.</li>
      </ul>

      <div style={{ marginTop: 16, color: '#e2e8f0', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FileCheck size={16} />
        Example input (stdin)
      </div>
      <Code>{inputExample}</Code>

      <div style={{ marginTop: 16, color: '#e2e8f0', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <FileCheck size={16} />
        Expected output schema
      </div>
      <Code>{schema}</Code>

      {/* Hint stepper (gated, generic; not language-specific, no code) */}
      <div style={{ marginTop: 20, paddingTop: 20, borderTop: '2px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={styles.title}>
          <Lightbulb size={18} />
          Hints
        </div>
        
        <div style={styles.note}>
          {failedAttempts === 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={14} />
              Try solving the challenge first! Hints unlock after failed attempts.
            </span>
          )}
          {failedAttempts > 0 && failedAttempts < thresholds.hint1 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} />
              First hint unlocks after {thresholds.hint1} failed attempts (current: {failedAttempts})
            </span>
          )}
          {failedAttempts >= thresholds.hint1 && failedAttempts < thresholds.hint2 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              Hint 1 unlocked! Keep trying for more hints.
            </span>
          )}
          {failedAttempts >= thresholds.hint2 && failedAttempts < thresholds.hint3 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              Hints 1-2 unlocked! One more hint available.
            </span>
          )}
          {failedAttempts >= thresholds.hint3 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} style={{ color: '#10b981' }} />
              All hints unlocked! You've got this!
            </span>
          )}
        </div>

        <div style={styles.buttonContainer}>
          {/* Hint 1 */}
          <button
            style={getButtonStyle(failedAttempts < thresholds.hint1, reveal1)}
            onClick={() => setReveal1(v => !v)}
            disabled={failedAttempts < thresholds.hint1}
            title={failedAttempts < thresholds.hint1 
              ? `Unlocks after ${thresholds.hint1} failed attempts` 
              : 'Click to toggle hint 1'}
            onMouseEnter={(e) => {
              if (failedAttempts >= thresholds.hint1) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (failedAttempts >= thresholds.hint1) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = reveal1 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {failedAttempts < thresholds.hint1 && <Lock size={14} />}
            {reveal1 ? <><EyeOff size={14} /> Hide hint 1</> : <><Lightbulb size={14} /> Show hint 1</>}
          </button>

          {/* Hint 2 */}
          <button
            style={getButtonStyle(failedAttempts < thresholds.hint2, reveal2)}
            onClick={() => setReveal2(v => !v)}
            disabled={failedAttempts < thresholds.hint2}
            title={failedAttempts < thresholds.hint2 
              ? `Unlocks after ${thresholds.hint2} failed attempts` 
              : 'Click to toggle hint 2'}
            onMouseEnter={(e) => {
              if (failedAttempts >= thresholds.hint2) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (failedAttempts >= thresholds.hint2) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = reveal2 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {failedAttempts < thresholds.hint2 && <Lock size={14} />}
            {reveal2 ? <><EyeOff size={14} /> Hide hint 2</> : <><Lightbulb size={14} /> Show hint 2</>}
          </button>

          {/* Hint 3 */}
          <button
            style={getButtonStyle(failedAttempts < thresholds.hint3, reveal3)}
            onClick={() => setReveal3(v => !v)}
            disabled={failedAttempts < thresholds.hint3}
            title={failedAttempts < thresholds.hint3 
              ? `Unlocks after ${thresholds.hint3} failed attempts` 
              : 'Click to toggle hint 3'}
            onMouseEnter={(e) => {
              if (failedAttempts >= thresholds.hint3) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (failedAttempts >= thresholds.hint3) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = reveal3 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {failedAttempts < thresholds.hint3 && <Lock size={14} />}
            {reveal3 ? <><EyeOff size={14} /> Hide hint 3</> : <><Lightbulb size={14} /> Show hint 3</>}
          </button>
        </div>

        {/* Hint 1 Content */}
        {reveal1 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginTop: 12,
            marginBottom: 12,
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={16} />
              Hint 1:
            </div>
            <ul style={{ margin: '0 0 0 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
              <li>Input is a JSON object with a key for the list (see the example).</li>
              <li>Make sure to handle an empty list safely (return zeros).</li>
            </ul>
          </div>
        )}

        {/* Hint 2 Content */}
        {reveal2 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginTop: 12,
            marginBottom: 12,
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={16} />
              Hint 2:
            </div>
            <ul style={{ margin: '0 0 0 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
              <li>Average is total sum divided by count; if integers are expected, use integer division or floor.</li>
              <li>Print a single JSON object that contains only the required keys (no extra keys/fields).</li>
            </ul>
          </div>
        )}

        {/* Hint 3 Content */}
        {reveal3 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 8,
            padding: 16,
            marginTop: 12,
            marginBottom: 12,
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: 8, fontSize: 15, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lightbulb size={16} />
              Hint 3:
            </div>
            <ul style={{ margin: '0 0 0 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8 }}>
              <li>Don't loop through multiple tests in your program—one run equals one test.</li>
              <li>Don't print debug logs (e.g., "Test 1 -{'>'} …"). Only the JSON result should be printed.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}