import React, { useState } from 'react';

export default function TestResultsPanel({ tests = [] }) {
  const [open, setOpen] = useState(() => tests.map(() => false));

  const toggle = (i) => {
    const next = [...open];
    next[i] = !next[i];
    setOpen(next);
  };

  const badge = (ok) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    color: ok ? '#155724' : '#721c24',
    background: ok ? '#d4edda' : '#f8d7da',
    border: `1px solid ${ok ? '#c3e6cb' : '#f5c6cb'}`
  });

  const mono = {
    fontFamily: 'Monaco, Consolas, monospace',
    fontSize: 13,
    whiteSpace: 'pre-wrap',
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 6,
    padding: '10px'
  };

  const itemBox = {
    border: '1px solid #e9ecef',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden'
  };

  const itemHeader = {
    cursor: 'pointer',
    padding: '10px 12px',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const itemBody = { padding: 12, background: '#fff' };

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: '0 0 8px 0' }}>🧪 Per-test results</h4>
      {tests.map((t, i) => (
        <div key={i} style={itemBox}>
          <div style={itemHeader} onClick={() => toggle(i)}>
            <div>
              <span style={badge(t.passed)}>{t.passed ? 'PASSED' : 'FAILED'}</span>
              <span style={{ marginLeft: 8, color: '#555' }}>Test {t.testNumber}</span>
            </div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {Math.round(t.executionTime)} ms • {Math.round(t.memoryUsage)} KB
              <span style={{ marginLeft: 8 }}>{open[i] ? '▲' : '▼'}</span>
            </div>
          </div>

          {open[i] && (
            <div style={itemBody}>
              {/* Show compiler/runtime errors if present */}
              {(t.compileOutput || t.stderr) && (
                <div style={{ marginBottom: 10 }}>
                  {t.compileOutput && (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>Compile Output</div>
                      <pre style={mono}>{t.compileOutput}</pre>
                    </>
                  )}
                  {t.stderr && (
                    <>
                      <div style={{ fontWeight: 600, margin: '8px 0 4px' }}>Stderr</div>
                      <pre style={mono}>{t.stderr}</pre>
                    </>
                  )}
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Input (stdin)</div>
                <pre style={mono}>{typeof t.input === 'string' ? t.input : JSON.stringify(t.input, null, 2)}</pre>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Expected</div>
                <pre style={mono}>{t.expectedOutput}</pre>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Actual</div>
                <pre style={mono}>{t.actualOutput}</pre>
              </div>

              {/* Diff details */}
              {t.diff && t.diff.mode === 'json' && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>JSON differences</div>
                  {t.diff.missingKeys?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ color: '#b45f06', fontWeight: 600 }}>Missing keys in output</div>
                      <ul style={{ margin: '4px 0 0 18px' }}>
                        {t.diff.missingKeys.map((k, idx) => <li key={idx}>{k}</li>)}
                      </ul>
                    </div>
                  )}
                  {t.diff.extraKeys?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ color: '#6a329f', fontWeight: 600 }}>Extra keys in output</div>
                      <ul style={{ margin: '4px 0 0 18px' }}>
                        {t.diff.extraKeys.map((k, idx) => <li key={idx}>{k}</li>)}
                      </ul>
                    </div>
                  )}
                  {t.diff.mismatches?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <div style={{ color: '#c92a2a', fontWeight: 600 }}>Value mismatches</div>
                      <ul style={{ margin: '4px 0 0 18px' }}>
                        {t.diff.mismatches.map((m, idx) => (
                          <li key={idx}>
                            <code>{m.path}</code>: expected <code>{JSON.stringify(m.expected)}</code>, got <code>{JSON.stringify(m.actual)}</code>
                            {typeof m.delta === 'number' ? ` (Δ ${m.delta})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(!t.diff.missingKeys?.length && !t.diff.extraKeys?.length && !t.diff.mismatches?.length) && (
                    <div style={{ color: '#155724' }}>No JSON differences detected (keys may differ in order).</div>
                  )}
                </div>
              )}

              {t.diff && t.diff.mode === 'text' && t.diff.firstDiffIndex >= 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>First difference (text)</div>
                  <div style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>
                    Index: {t.diff.firstDiffIndex}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Expected (preview)</div>
                      <pre style={mono}>{t.diff.expectedPreview}</pre>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Actual (preview)</div>
                      <pre style={mono}>{t.diff.actualPreview}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}