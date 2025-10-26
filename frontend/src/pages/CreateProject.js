// frontend/src/pages/CreateProject.js - WITH STYLED SCROLLBAR AND GRADIENT CONTAINER
import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { suggestionsService } from '../services/suggestionsService';

// Enhanced MultiSelectInput component for programming languages and topics
function MultiSelectInput({ label, selectedItems, onSelectionChange, suggestions, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(item => 
        item && 
        item.name && 
        typeof item.name === 'string' &&
        item.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.some(selected => selected && selected.name === item.name)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
      setFocusedIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, selectedItems]);

  const handleAddItem = (item) => {
    if (item && item.name && !selectedItems.some(selected => selected && selected.name === item.name)) {
      onSelectionChange([...selectedItems, item]);
      setInputValue('');
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    onSelectionChange(selectedItems.filter(item => item && itemToRemove && item.name !== itemToRemove.name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        handleAddItem(filteredSuggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        const customItem = { 
          name: inputValue.trim(), 
          id: `custom_${Date.now()}`,
          isCustom: true
        };
        handleAddItem(customItem);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const styles = {
    container: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#E8EDF9',
      fontSize: '14px'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)'
    },
    inputFocused: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)'
    },
    selectedItems: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '12px',
      marginBottom: '8px',
      minHeight: selectedItems.length > 0 ? 'auto' : '0'
    },
    selectedItem: {
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      color: 'white',
      padding: '8px 14px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '200px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
    },
    selectedItemText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    removeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '0',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s ease'
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'rgba(26, 28, 32, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
    },
    suggestion: {
      padding: '12px 16px',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'background-color 0.2s ease'
    },
    suggestionFocused: {
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#93c5fd'
    },
    suggestionName: {
      fontWeight: '500',
      fontSize: '14px',
      color: '#E8EDF9'
    },
    suggestionDescription: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '2px'
    },
    itemCount: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '6px'
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputContainer}>
        <input
          type="text"
          style={{
            ...styles.input,
            ...(showSuggestions ? styles.inputFocused : {})
          }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => inputValue.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={styles.suggestions} className="custom-scrollbar">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                style={{
                  ...styles.suggestion,
                  ...(index === focusedIndex ? styles.suggestionFocused : {}),
                }}
                onClick={() => handleAddItem(suggestion)}
              >
                <div style={styles.suggestionName}>{suggestion.name}</div>
                {suggestion.description && (
                  <div style={styles.suggestionDescription}>
                    {suggestion.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div style={styles.selectedItems}>
          {selectedItems.filter(item => item && item.name).map((item, index) => (
            <div key={item.id || index} style={styles.selectedItem}>
              <span style={styles.selectedItemText}>
                {item.name}{item.isCustom && ' (custom)'}
              </span>
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => handleRemoveItem(item)}
                title="Remove"
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.itemCount}>
        Selected: {selectedItems.filter(item => item && item.name).length}
      </div>
    </div>
  );
}

function CreateProject({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    selectedTopics: [],
    selectedLanguages: [],
    required_experience_level: '',
    maximum_members: '',
    estimated_duration_weeks: '',
    difficulty_level: '',
    github_repo_url: '',
    deadline: '',
    termsAccepted: null
  });

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [topics, languages] = await Promise.all([
          suggestionsService.getTopics(),
          suggestionsService.getProgrammingLanguages()
        ]);
        setTopicSuggestions(topics);
        setLanguageSuggestions(languages);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };
    loadSuggestions();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        detailed_description: formData.detailed_description?.trim() || null,
        required_experience_level: formData.required_experience_level || null,
        maximum_members: formData.maximum_members ? parseInt(formData.maximum_members) : null,
        estimated_duration_weeks: formData.estimated_duration_weeks ? parseInt(formData.estimated_duration_weeks) : null,
        difficulty_level: formData.difficulty_level || null,
        github_repo_url: formData.github_repo_url?.trim() || undefined,
        deadline: formData.deadline || undefined,
        programming_languages: formData.selectedLanguages.filter(lang => lang && lang.name).map(lang => lang.name),
        topics: formData.selectedTopics.filter(topic => topic && topic.name).map(topic => topic.name)
      };

      const response = await projectService.createProject(projectData);
      
      if (response.success) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Project creation error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors.map(err => err.msg));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Failed to create project. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    },
    modal: {
      // GRADIENT CONTAINER - matching Login.js
      background: 'linear-gradient(135deg, rgba(42, 46, 57, 0.95) 0%, rgba(28, 31, 38, 0.98) 50%, rgba(20, 22, 28, 1) 100%)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '32px',
      width: '90%',
      maxWidth: '650px',
      maxHeight: '90vh',
      overflowY: 'auto',
      position: 'relative',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#9ca3af',
      padding: '8px',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    title: {
      margin: '0 0 24px 0',
      color: '#E8EDF9',
      fontSize: '28px',
      fontWeight: 'bold'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '8px',
      fontWeight: '600',
      color: '#E8EDF9',
      fontSize: '14px'
    },
    input: {
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      outline: 'none'
    },
    textarea: {
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    select: {
      padding: '12px 16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      outline: 'none',
      transition: 'all 0.3s ease'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '32px',
      gap: '16px'
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      minWidth: '120px'
    },
    primaryButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
    },
    secondaryButton: {
      width: '80px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#E8EDF9',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      backdropFilter: 'blur(8px)'
    },
    disabledButton: {
      backgroundColor: 'rgba(107, 114, 128, 0.3)',
      color: '#6b7280',
      cursor: 'not-allowed',
      boxShadow: 'none'
    },
    errorContainer: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      color: '#fca5a5',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '24px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      backdropFilter: 'blur(8px)'
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
      marginBottom: '24px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      transition: 'width 0.3s ease',
      width: `${(currentStep / 3) * 100}%`
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: '#9ca3af'
    },
    stepNumber: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#9ca3af',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      fontSize: '12px',
      fontWeight: 'bold',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    stepNumberActive: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      borderColor: '#3b82f6'
    },
    stepNumberCompleted: {
      background: 'linear-gradient(to right, #10b981, #059669)',
      color: 'white',
      borderColor: '#10b981'
    },
    termsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    termsItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)'
    },
    termsItemSelected: {
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    radio: {
      marginTop: '3px',
      accentColor: '#3b82f6'
    },
    termsText: {
      flex: 1
    },
    termsTitle: {
      fontWeight: '600',
      marginBottom: '6px',
      color: '#E8EDF9'
    },
    termsDescription: {
      fontSize: '14px',
      color: '#9ca3af',
      lineHeight: '1.5'
    },
    summaryContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(8px)'
    },
    summaryTitle: {
      margin: '0 0 20px 0',
      color: '#E8EDF9',
      fontSize: '18px',
      fontWeight: '600'
    },
    summaryItem: {
      marginBottom: '16px'
    },
    summaryLabel: {
      fontWeight: '600',
      color: '#E8EDF9',
      marginBottom: '4px'
    },
    summaryValue: {
      color: '#9ca3af',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    agreementContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontSize: '14px',
      color: '#9ca3af',
      backdropFilter: 'blur(8px)'
    },
    characterCount: {
      fontSize: '12px',
      color: '#6b7280',
      marginTop: '6px'
    }
  };

  // CUSTOM SCROLLBAR STYLES - BLACK/GRAYISH
  const scrollbarStyles = `
    /* Custom Scrollbar - Black/Grayish theme */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #1f2937, #111827);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #374151, #1f2937);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }

    /* Firefox scrollbar */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #1f2937 rgba(0, 0, 0, 0.2);
    }
  `;

  // Step 1: Basic Information
  if (currentStep === 1) {
    return (
      <>
        <style>{scrollbarStyles}</style>
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div style={styles.modal} className="custom-scrollbar">
            <button 
              style={styles.closeButton} 
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = '#E8EDF9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
            
            <div style={styles.header}>
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
              
              <div style={styles.stepIndicator}>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>1</div>
                  Basic Info
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNumber}>2</div>
                  Details
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNumber}>3</div>
                  Review
                </div>
              </div>
              
              <h2 style={styles.title}>Create New Project</h2>
            </div>

            {errors.length > 0 && (
              <div style={styles.errorContainer}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a compelling project title"
                  maxLength="100"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Short Description *</label>
                <textarea
                  style={styles.textarea}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a brief overview of your project (2-3 sentences)"
                  maxLength="500"
                  className="custom-scrollbar"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={styles.characterCount}>
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Detailed Description</label>
                <textarea
                  style={{...styles.textarea, minHeight: '150px'}}
                  value={formData.detailed_description}
                  onChange={(e) => handleInputChange('detailed_description', e.target.value)}
                  placeholder="Provide more details about your project goals, features, and requirements"
                  maxLength="2000"
                  className="custom-scrollbar"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={styles.characterCount}>
                  {formData.detailed_description.length}/2000 characters
                </div>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button 
                style={styles.secondaryButton} 
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...((!formData.title.trim() || !formData.description.trim()) ? styles.disabledButton : {})
                }}
                onClick={handleNext}
                disabled={!formData.title.trim() || !formData.description.trim()}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 2: Project Details
  if (currentStep === 2) {
    return (
      <>
        <style>{scrollbarStyles}</style>
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div style={styles.modal} className="custom-scrollbar">
            <button 
              style={styles.closeButton} 
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = '#E8EDF9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
            
            <div style={styles.header}>
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
              
              <div style={styles.stepIndicator}>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                  Basic Info
                </div>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>2</div>
                  Details
                </div>
                <div style={styles.stepItem}>
                  <div style={styles.stepNumber}>3</div>
                  Review
                </div>
              </div>
              
              <h2 style={styles.title}>Project Details</h2>
            </div>

            {errors.length > 0 && (
              <div style={styles.errorContainer}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.form}>
              <MultiSelectInput
                label="Topics *"
                selectedItems={formData.selectedTopics}
                onSelectionChange={(topics) => handleInputChange('selectedTopics', topics)}
                suggestions={topicSuggestions}
                placeholder="e.g., Web Development, Mobile App, Data Science"
              />

              <MultiSelectInput
                label="Programming Languages *"
                selectedItems={formData.selectedLanguages}
                onSelectionChange={(languages) => handleInputChange('selectedLanguages', languages)}
                suggestions={languageSuggestions}
                placeholder="e.g., JavaScript, Python, Java"
              />

              <div style={styles.inputGroup}>
                <label style={styles.label}>Required Experience Level</label>
                <select
                  style={styles.select}
                  value={formData.required_experience_level}
                  onChange={(e) => handleInputChange('required_experience_level', e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Maximum Members</label>
                <input
                  type="number"
                  style={styles.input}
                  min="1"
                  max="50"
                  value={formData.maximum_members}
                  onChange={(e) => handleInputChange('maximum_members', e.target.value)}
                  placeholder="Maximum team size (1-50)"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Estimated Duration (weeks)</label>
                <input
                  type="number"
                  style={styles.input}
                  min="1"
                  max="104"
                  value={formData.estimated_duration_weeks}
                  onChange={(e) => handleInputChange('estimated_duration_weeks', e.target.value)}
                  placeholder="How many weeks will this project take?"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Difficulty Level</label>
                <select
                  style={styles.select}
                  value={formData.difficulty_level}
                  onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>GitHub Repository (optional)</label>
                <input
                  type="url"
                  style={styles.input}
                  value={formData.github_repo_url}
                  onChange={(e) => handleInputChange('github_repo_url', e.target.value)}
                  placeholder="https://github.com/username/repository"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Deadline (optional)</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button 
                style={styles.secondaryButton} 
                onClick={handleBack}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Back
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(formData.selectedTopics.length === 0 || formData.selectedLanguages.length === 0 ? styles.disabledButton : {})
                }}
                onClick={handleNext}
                disabled={formData.selectedTopics.length === 0 || formData.selectedLanguages.length === 0}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 3: Review and Terms
  if (currentStep === 3) {
    return (
      <>
        <style>{scrollbarStyles}</style>
        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <div style={styles.modal} className="custom-scrollbar">
            <button 
              style={styles.closeButton} 
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = '#E8EDF9';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
            
            <div style={styles.header}>
              <div style={styles.progressBar}>
                <div style={styles.progressFill}></div>
              </div>
              
              <div style={styles.stepIndicator}>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                  Basic Info
                </div>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                  Details
                </div>
                <div style={styles.stepItem}>
                  <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>3</div>
                  Review
                </div>
              </div>
              
              <h2 style={styles.title}>Review & Confirm</h2>
            </div>

            {errors.length > 0 && (
              <div style={styles.errorContainer}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.form}>
              <div style={styles.summaryContainer}>
                <h3 style={styles.summaryTitle}>Project Summary</h3>
                
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Title:</div>
                  <div style={styles.summaryValue}>{formData.title}</div>
                </div>
                
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Description:</div>
                  <div style={styles.summaryValue}>{formData.description}</div>
                </div>
                
                {formData.detailed_description && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Detailed Description:</div>
                    <div style={styles.summaryValue}>{formData.detailed_description}</div>
                  </div>
                )}
                
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Topics:</div>
                  <div style={styles.summaryValue}>{formData.selectedTopics.map(t => t.name).join(', ')}</div>
                </div>
                
                <div style={styles.summaryItem}>
                  <div style={styles.summaryLabel}>Programming Languages:</div>
                  <div style={styles.summaryValue}>{formData.selectedLanguages.map(l => l.name).join(', ')}</div>
                </div>
                
                {formData.required_experience_level && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Required Experience:</div>
                    <div style={styles.summaryValue}>{formData.required_experience_level}</div>
                  </div>
                )}
                
                {formData.maximum_members && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Maximum Members:</div>
                    <div style={styles.summaryValue}>{formData.maximum_members}</div>
                  </div>
                )}
                
                {formData.estimated_duration_weeks && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Estimated Duration:</div>
                    <div style={styles.summaryValue}>{formData.estimated_duration_weeks} weeks</div>
                  </div>
                )}
                
                {formData.difficulty_level && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Difficulty Level:</div>
                    <div style={styles.summaryValue}>{formData.difficulty_level}</div>
                  </div>
                )}
                
                {formData.github_repo_url && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>GitHub Repository:</div>
                    <div style={styles.summaryValue}>{formData.github_repo_url}</div>
                  </div>
                )}
                
                {formData.deadline && (
                  <div style={styles.summaryItem}>
                    <div style={styles.summaryLabel}>Deadline:</div>
                    <div style={styles.summaryValue}>{new Date(formData.deadline).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Terms *</label>
                <div style={styles.termsContainer}>
                  <div 
                    style={{
                      ...styles.termsItem,
                      ...(formData.termsAccepted === 'open' ? styles.termsItemSelected : {})
                    }}
                    onClick={() => handleInputChange('termsAccepted', 'open')}
                  >
                    <input
                      type="radio"
                      name="terms"
                      value="open"
                      checked={formData.termsAccepted === 'open'}
                      onChange={() => handleInputChange('termsAccepted', 'open')}
                      style={styles.radio}
                    />
                    <div style={styles.termsText}>
                      <div style={styles.termsTitle}>Open Collaboration</div>
                      <div style={styles.termsDescription}>
                        This project is open for anyone to join. Team members can contribute 
                        according to their availability and skill level. Perfect for learning 
                        and networking.
                      </div>
                    </div>
                  </div>

                  <div 
                    style={{
                      ...styles.termsItem,
                      ...(formData.termsAccepted === 'committed' ? styles.termsItemSelected : {})
                    }}
                    onClick={() => handleInputChange('termsAccepted', 'committed')}
                  >
                    <input
                      type="radio"
                      name="terms"
                      value="committed"
                      checked={formData.termsAccepted === 'committed'}
                      onChange={() => handleInputChange('termsAccepted', 'committed')}
                      style={styles.radio}
                    />
                    <div style={styles.termsText}>
                      <div style={styles.termsTitle}>Committed Team</div>
                      <div style={styles.termsDescription}>
                        This project requires dedicated team members who can commit to regular 
                        participation and meeting deadlines. Ideal for serious development work.
                      </div>
                    </div>
                  </div>

                  <div 
                    style={{
                      ...styles.termsItem,
                      ...(formData.termsAccepted === 'commercial' ? styles.termsItemSelected : {})
                    }}
                    onClick={() => handleInputChange('termsAccepted', 'commercial')}
                  >
                    <input
                      type="radio"
                      name="terms"
                      value="commercial"
                      checked={formData.termsAccepted === 'commercial'}
                      onChange={() => handleInputChange('termsAccepted', 'commercial')}
                      style={styles.radio}
                    />
                    <div style={styles.termsText}>
                      <div style={styles.termsTitle}>Commercial Project</div>
                      <div style={styles.termsDescription}>
                        This project has commercial potential. Team members may be eligible 
                        for revenue sharing or equity based on contribution and agreement.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.agreementContainer}>
                <p style={{ margin: '0 0 12px 0' }}>
                  By creating this project, you agree to:
                </p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Maintain respectful and professional communication with team members</li>
                  <li>Provide clear project requirements and expectations</li>
                  <li>Respect intellectual property rights and open-source licenses</li>
                  <li>Follow TechSync's community guidelines and code of conduct</li>
                </ul>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button
                style={styles.secondaryButton}
                onClick={handleBack}
                disabled={isSubmitting}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                Back
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...((!formData.termsAccepted || isSubmitting) ? styles.disabledButton : {})
                }}
                onClick={handleSubmit}
                disabled={!formData.termsAccepted || isSubmitting}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {isSubmitting ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}

export default CreateProject;