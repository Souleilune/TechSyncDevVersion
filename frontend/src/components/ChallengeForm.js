// frontend/src/components/ChallengeForm.js - ALIGNED WITH DARK THEME
import React, { useState, useEffect } from 'react';
import ChallengeAPI from '../services/challengeAPI';
import { Plus, Trash2, Code } from 'lucide-react';

const ChallengeForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'easy',
    time_limit_minutes: 30,
    programming_language_id: '',
    project_id: '',
    starter_code: '',
    expected_solution: '',
    test_cases: ''
  });

  const [languages, setLanguages] = useState([]);
  const [testCaseFields, setTestCaseFields] = useState([{ input: '', expected_output: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty_level: initialData.difficulty_level || 'easy',
        time_limit_minutes: initialData.time_limit_minutes || 30,
        programming_language_id: initialData.programming_language_id || '',
        project_id: initialData.project_id || '',
        starter_code: initialData.starter_code || '',
        expected_solution: initialData.expected_solution || '',
        test_cases: initialData.test_cases || ''
      });

      // Parse existing test cases
      if (initialData.test_cases) {
        try {
          const existingTestCases = Array.isArray(initialData.test_cases) 
            ? initialData.test_cases 
            : JSON.parse(initialData.test_cases);
          
          setTestCaseFields(existingTestCases.map(tc => ({
            input: JSON.stringify(tc.input, null, 2),
            expected_output: JSON.stringify(tc.expected_output, null, 2)
          })));
        } catch (error) {
          console.error('Error parsing test cases:', error);
        }
      }
    }
  }, [initialData]);

  // Load programming languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await ChallengeAPI.getProgrammingLanguages();
        setLanguages(response.data || []);
      } catch (error) {
        console.error('Error loading languages:', error);
        setError('Failed to load programming languages');
      }
    };

    loadLanguages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCaseFields];
    newTestCases[index][field] = value;
    setTestCaseFields(newTestCases);
  };

  const addTestCase = () => {
    setTestCaseFields([...testCaseFields, { input: '', expected_output: '' }]);
  };

  const removeTestCase = (index) => {
    if (testCaseFields.length > 1) {
      setTestCaseFields(testCaseFields.filter((_, i) => i !== index));
    }
  };

  const generateTestCasesJSON = () => {
    return testCaseFields
      .filter(tc => tc.input.trim() && tc.expected_output.trim()) // Only include non-empty test cases
      .map(testCase => {
        try {
          return {
            input: JSON.parse(testCase.input),
            expected_output: JSON.parse(testCase.expected_output)
          };
        } catch (error) {
          // If JSON parsing fails, use as string
          return {
            input: testCase.input,
            expected_output: testCase.expected_output
          };
        }
      });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.programming_language_id) {
      setError('Programming language is required');
      return false;
    }
    if (formData.time_limit_minutes < 5 || formData.time_limit_minutes > 300) {
      setError('Time limit must be between 5 and 300 minutes');
      return false;
    }

    // Validate test cases JSON
    const hasValidTestCase = testCaseFields.some(tc => tc.input.trim() && tc.expected_output.trim());
    if (!hasValidTestCase) {
      setError('At least one test case is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const challengeData = {
        ...formData,
        test_cases: JSON.stringify(generateTestCasesJSON()),
        programming_language_id: parseInt(formData.programming_language_id),
        project_id: formData.project_id || null
      };

      let response;
      if (initialData) {
        // Update existing challenge
        response = await ChallengeAPI.updateChallenge(initialData.id, challengeData);
      } else {
        // Create new challenge
        response = await ChallengeAPI.createChallenge(challengeData);
      }

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.challenge);
        }
        
        // Reset form if creating new challenge
        if (!initialData) {
          setFormData({
            title: '',
            description: '',
            difficulty_level: 'easy',
            time_limit_minutes: 30,
            programming_language_id: '',
            project_id: '',
            starter_code: '',
            expected_solution: '',
            test_cases: ''
          });
          setTestCaseFields([{ input: '', expected_output: '' }]);
        }
      }
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
      setError(error.response?.data?.message || 'Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    form: {
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '32px',
      color: 'white'
    },
    title: {
      textAlign: 'center',
      color: 'white',
      marginBottom: '32px',
      fontSize: '24px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#d1d5db',
      fontSize: '14px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: '40px',
      boxSizing: 'border-box'
    },
    testCaseContainer: {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)'
    },
    testCaseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    testCaseTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    addButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    removeButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      padding: '6px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    submitButton: {
      background: 'linear-gradient(to right, #22c55e, #16a34a)',
      color: 'white',
      padding: '14px 32px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      width: '100%',
      marginTop: '20px',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
    },
    cancelButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#cbd5e1',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      width: '100%',
      marginTop: '12px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    error: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#fca5a5',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px',
      backdropFilter: 'blur(8px)',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Global styles for select options and focus states */}
      <style dangerouslySetInnerHTML={{
        __html: `
          select option {
            background-color: #1a1c20 !important;
            color: white !important;
            padding: 8px 12px !important;
            border: none !important;
            font-size: 14px !important;
          }
          
          select option:hover {
            background-color: #2563eb !important;
            color: white !important;
          }
          
          select:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
          }
          
          input:focus, textarea:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
          }
          
          input::placeholder, textarea::placeholder {
            color: #9ca3af !important;
            opacity: 1 !important;
          }
        `
      }} />
      
      <div style={styles.form}>
        <h2 style={styles.title}>
          <Code size={24} style={{ color: '#3b82f6' }} />
          {initialData ? 'Edit' : 'Create New'} Coding Challenge
        </h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Challenge Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="e.g., Two Sum Problem"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            style={styles.textarea}
            placeholder="Detailed description of the challenge..."
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Difficulty Level *</label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Time Limit (minutes) *</label>
            <input
              type="number"
              name="time_limit_minutes"
              value={formData.time_limit_minutes}
              onChange={handleInputChange}
              required
              min="5"
              max="300"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Programming Language *</label>
          <select
            name="programming_language_id"
            value={formData.programming_language_id}
            onChange={handleInputChange}
            required
            style={styles.select}
          >
            <option value="">Select a language...</option>
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Project (Optional)</label>
          <input
            type="text"
            name="project_id"
            value={formData.project_id}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Project ID (leave blank for general challenges)"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Starter Code</label>
          <textarea
            name="starter_code"
            value={formData.starter_code}
            onChange={handleInputChange}
            style={styles.textarea}
            placeholder="Initial code template for users..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Expected Solution</label>
          <textarea
            name="expected_solution"
            value={formData.expected_solution}
            onChange={handleInputChange}
            style={styles.textarea}
            placeholder="Complete working solution..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Test Cases *</label>
          {testCaseFields.map((testCase, index) => (
            <div key={index} style={styles.testCaseContainer}>
              <div style={styles.testCaseHeader}>
                <div style={styles.testCaseTitle}>
                  <Code size={16} style={{ color: '#3b82f6' }} />
                  Test Case {index + 1}
                </div>
                {testCaseFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    style={styles.removeButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ef4444';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                )}
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Input (JSON format)</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    style={{...styles.textarea, minHeight: '80px'}}
                    placeholder='{"nums": [1, 2, 3], "target": 4}'
                  />
                </div>
                <div>
                  <label style={styles.label}>Expected Output (JSON format)</label>
                  <textarea
                    value={testCase.expected_output}
                    onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                    style={{...styles.textarea, minHeight: '80px'}}
                    placeholder='[0, 2]'
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTestCase}
            style={styles.addButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Plus size={16} />
            Add Test Case
          </button>
        </div>

        <button 
          onClick={handleSubmit} 
          style={styles.submitButton}
          disabled={loading}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }
          }}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Challenge' : 'Create Challenge')}
        </button>

        {onCancel && (
          <button 
            onClick={onCancel} 
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeForm;