import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const MentionInput = forwardRef(({
    value,
    onChange,
    onMentionsChange,
    projectMembers = [],
    projectOwner = null, // NEW: Add project owner separately
    placeholder,
    disabled
}, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [mentionStart, setMentionStart] = useState(-1);
    const textareaRef = useRef(null);

    useImperativeHandle(ref, () => textareaRef.current);

    // ✅ FIXED: Create a unified list of all project members including owner
    const getAllProjectMembers = () => {
        const allMembers = [];
        
        // Add project owner first (if exists)
        if (projectOwner) {
            allMembers.push({
                id: projectOwner.id,
                full_name: projectOwner.full_name || projectOwner.username || 'Project Owner',
                username: projectOwner.username,
                email: projectOwner.email,
                role: 'owner',
                avatar_url: projectOwner.avatar_url,
                isOwner: true
            });
        }
        
        // Add regular members (data structure: member.users.*)
        if (projectMembers && projectMembers.length > 0) {
            projectMembers.forEach(member => {
                if (member && member.users) {
                    allMembers.push({
                        id: member.users.id,
                        full_name: member.users.full_name || member.users.username || 'Team Member',
                        username: member.users.username,
                        email: member.users.email,
                        role: member.role || 'member',
                        avatar_url: member.users.avatar_url,
                        isOwner: false
                    });
                }
            });
        }
        
        return allMembers;
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        onChange(newValue);
        setCursorPosition(cursorPos);
        
        // Check for @ mentions
        checkForMentions(newValue, cursorPos);
    };

    const checkForMentions = (text, cursorPos) => {
        console.log('🔍 Checking mentions - text:', text, 'cursor:', cursorPos);
        
        // Find the last @ before cursor position
        let mentionIndex = -1;
        for (let i = cursorPos - 1; i >= 0; i--) {
            if (text[i] === '@') {
                mentionIndex = i;
                break;
            }
            if (text[i] === ' ' || text[i] === '\n') {
                break;
            }
        }

        if (mentionIndex >= 0) {
            const searchTerm = text.slice(mentionIndex + 1, cursorPos).toLowerCase();
            console.log('📍 Found @ at position:', mentionIndex, 'search term:', searchTerm);
            
            // Show suggestions even for empty search term after @
            const allMembers = getAllProjectMembers();
            console.log('👥 All members:', allMembers.length);
            
            const filteredMembers = allMembers.filter(member => {
                // ✅ FIXED: Safe access with proper null checks
                if (!member || !member.full_name) {
                    return false;
                }
                
                const fullName = member.full_name.toLowerCase();
                const username = (member.username || '').toLowerCase();
                
                // Show all members if no search term, otherwise filter
                return searchTerm === '' || fullName.includes(searchTerm) || username.includes(searchTerm);
            });

            console.log('✅ Filtered members:', filteredMembers.length);
            setSuggestions(filteredMembers.slice(0, 8));
            setMentionStart(mentionIndex);
            setShowSuggestions(true);
            return;
        }

        console.log('❌ No @ found, hiding suggestions');
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionStart(-1);
    };

    const insertMention = (member) => {
        console.log('🎯 Inserting mention for:', member.full_name);
        
        if (mentionStart === -1) {
            console.log('❌ No mention start position found');
            return;
        }

        const beforeMention = value.slice(0, mentionStart);
        const afterCursor = value.slice(cursorPosition);
        // ✅ FIXED: Use proper format @UserName with space
        const mentionText = `@${member.full_name} `;
        
        const newValue = beforeMention + mentionText + afterCursor;
        const newCursorPos = mentionStart + mentionText.length;
        
        console.log('📝 New value:', newValue);
        console.log('📍 New cursor position:', newCursorPos);
        
        onChange(newValue);
        setShowSuggestions(false);
        setSuggestions([]);
        setMentionStart(-1);

        // Update mentions array
        const currentMentions = extractMentions(newValue);
        if (onMentionsChange) {
            onMentionsChange(currentMentions);
        }

        // ✅ FIXED: Proper focus and cursor positioning
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                setCursorPosition(newCursorPos);
                console.log('✅ Focus and cursor set');
            }
        }, 10);
    };

    const extractMentions = (text) => {
        const mentions = [];
        const mentionRegex = /@([A-Za-z\s]+)/g;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            const mentionName = match[1].trim();
            const allMembers = getAllProjectMembers();
            
            // ✅ FIXED: Safe member lookup
            const member = allMembers.find(m => 
                m && m.full_name && m.full_name === mentionName
            );
            
            if (member && !mentions.includes(member.id)) {
                mentions.push(member.id);
            }
        }

        return mentions;
    };

    const handleKeyDown = (e) => {
        if (showSuggestions && suggestions.length > 0) {
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                e.preventDefault();
            }
        }
    };

    const handleBlur = (e) => {
        // ✅ FIXED: Don't hide suggestions immediately if clicking on a suggestion
        // Check if the click target is within the suggestions dropdown
        const suggestionContainer = e.relatedTarget?.closest('.mention-suggestions');
        if (!suggestionContainer) {
            // Delay hiding suggestions to allow clicking
            setTimeout(() => {
                setShowSuggestions(false);
            }, 200);
        }
    };

    const handleSuggestionClick = (e, member) => {
        e.preventDefault();
        e.stopPropagation();
        insertMention(member);
    };

    // ✅ FIXED: Helper function to get avatar initials safely
    const getAvatarInitials = (member) => {
        if (member.full_name) {
            return member.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        }
        if (member.username) {
            return member.username.slice(0, 2).toUpperCase();
        }
        return '??';
    };

    // ✅ FIXED: Helper function to get role badge color matching project styling
    const getRoleBadgeStyle = (role, isOwner) => {
        if (isOwner) {
            return {
                backgroundColor: '#e74c3c',
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: '600',
                textTransform: 'uppercase'
            };
        }
        
        const roleColors = {
            'lead': '#f39c12',
            'moderator': '#9b59b6',
            'member': '#3498db'
        };
        
        return {
            backgroundColor: roleColors[role] || '#3498db',
            color: '#ffffff',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: '600',
            textTransform: 'uppercase'
        };
    };

    return (
        <div className="mention-input-container">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
                className="mention-textarea"
                rows={3}
            />
            
            {showSuggestions && suggestions.length > 0 && (
                <div className="mention-suggestions">
                    {suggestions.map((member) => (
                        <div
                            key={member.id}
                            className="mention-suggestion"
                            onMouseDown={(e) => handleSuggestionClick(e, member)}
                        >
                            <div className="member-avatar">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getAvatarInitials(member)}
                                    </div>
                                )}
                            </div>
                            <div className="member-info">
                                <div className="member-name">
                                    {member.full_name}
                                    {member.isOwner && (
                                        <span style={{ marginLeft: '8px' }}>
                                            <span style={getRoleBadgeStyle(member.role, member.isOwner)}>
                                                Owner
                                            </span>
                                        </span>
                                    )}
                                </div>
                                <div className="member-role">
                                    {member.isOwner ? 'Project Owner' : member.role || 'member'}
                                    {member.username && ` • @${member.username}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});

MentionInput.displayName = 'MentionInput';

export default MentionInput;