// frontend/src/pages/soloproject/SoloProjectNotes.js - ALIGNED WITH PROJECT THEME
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Save, 
  Trash2, 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  StickyNote,
  BookOpen,
  Lightbulb,
  Code2,
  Bug,
  Target,
  RefreshCw,
  AlertTriangle,
  Check,
  ChevronDown,
  PanelLeft
} from 'lucide-react';
import SoloProjectService from '../../services/soloProjectService';

// Background symbols component - WITH FLOATING ANIMATIONS
const BackgroundSymbols = () => (
  <>
    {/* Floating Animation CSS */}
    <style>
      {`
        @keyframes floatAround1 {
          0%, 100% { transform: translate(0, 0) rotate(-15deg); }
          25% { transform: translate(20px, -15px) rotate(-10deg); }
          50% { transform: translate(-10px, 20px) rotate(-20deg); }
          75% { transform: translate(15px, 5px) rotate(-12deg); }
        }
        @keyframes floatAround2 {
          0%, 100% { transform: translate(0, 0) rotate(20deg); }
          33% { transform: translate(-20px, 10px) rotate(25deg); }
          66% { transform: translate(25px, -8px) rotate(15deg); }
        }
        @keyframes floatAround3 {
          0%, 100% { transform: translate(0, 0) rotate(-25deg); }
          20% { transform: translate(-15px, -20px) rotate(-20deg); }
          40% { transform: translate(20px, 15px) rotate(-30deg); }
          60% { transform: translate(-8px, -10px) rotate(-22deg); }
          80% { transform: translate(12px, 18px) rotate(-28deg); }
        }
        @keyframes floatAround4 {
          0%, 100% { transform: translate(0, 0) rotate(30deg); }
          50% { transform: translate(-30px, 25px) rotate(35deg); }
        }
        @keyframes floatAround5 {
          0%, 100% { transform: translate(0, 0) rotate(-10deg); }
          25% { transform: translate(15px, -20px) rotate(-5deg); }
          50% { transform: translate(-25px, 15px) rotate(-15deg); }
          75% { transform: translate(20px, 10px) rotate(-8deg); }
        }
        @keyframes floatAround6 {
          0%, 100% { transform: translate(0, 0) rotate(15deg); }
          33% { transform: translate(-12px, -15px) rotate(20deg); }
          66% { transform: translate(25px, 20px) rotate(10deg); }
        }
        @keyframes driftSlow {
          0%, 100% { transform: translate(0, 0) rotate(35deg); }
          25% { transform: translate(-25px, 15px) rotate(40deg); }
          50% { transform: translate(15px, -25px) rotate(30deg); }
          75% { transform: translate(-8px, 30px) rotate(38deg); }
        }
        @keyframes gentleDrift {
          0%, 100% { transform: translate(0, 0) rotate(-20deg); }
          50% { transform: translate(20px, -30px) rotate(-15deg); }
        }
        @keyframes floatExtra1 {
          0%, 100% { transform: translate(0, 0) rotate(18deg); }
          33% { transform: translate(-18px, 20px) rotate(23deg); }
          66% { transform: translate(22px, -15px) rotate(13deg); }
        }
        @keyframes floatExtra2 {
          0%, 100% { transform: translate(0, 0) rotate(-37deg); }
          25% { transform: translate(25px, 18px) rotate(-32deg); }
          50% { transform: translate(-20px, -22px) rotate(-42deg); }
          75% { transform: translate(15px, -10px) rotate(-35deg); }
        }
        @keyframes floatExtra3 {
          0%, 100% { transform: translate(0, 0) rotate(28deg); }
          50% { transform: translate(-28px, 30px) rotate(33deg); }
        }
        @keyframes floatExtra4 {
          0%, 100% { transform: translate(0, 0) rotate(24deg); }
          40% { transform: translate(20px, -25px) rotate(29deg); }
          80% { transform: translate(-15px, 20px) rotate(19deg); }
        }
        @keyframes floatExtra5 {
          0%, 100% { transform: translate(0, 0) rotate(25deg); }
          35% { transform: translate(-22px, -18px) rotate(30deg); }
          70% { transform: translate(18px, 25px) rotate(20deg); }
        }
        @keyframes floatExtra6 {
          0%, 100% { transform: translate(0, 0) rotate(-19deg); }
          50% { transform: translate(25px, -20px) rotate(-14deg); }
        }
        @keyframes globalLogoRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .global-loading-spinner {
          animation: globalLogoRotate 2s linear infinite;
        }
        .floating-symbol {
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        
        .floating-symbol:nth-child(1) { animation: floatAround1 12s infinite; }
        .floating-symbol:nth-child(2) { animation: floatAround2 15s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(3) { animation: floatAround3 10s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(4) { animation: floatAround4 18s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(5) { animation: floatAround5 14s infinite; animation-delay: -1s; }
        .floating-symbol:nth-child(6) { animation: floatAround6 11s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(7) { animation: driftSlow 20s infinite; animation-delay: -8s; }
        .floating-symbol:nth-child(8) { animation: gentleDrift 16s infinite; animation-delay: -3s; }
        .floating-symbol:nth-child(9) { animation: floatExtra1 13s infinite; animation-delay: -7s; }
        .floating-symbol:nth-child(10) { animation: floatExtra2 17s infinite; animation-delay: -9s; }
        .floating-symbol:nth-child(11) { animation: floatExtra3 14s infinite; animation-delay: -4s; }
        .floating-symbol:nth-child(12) { animation: floatExtra4 19s infinite; animation-delay: -10s; }
        .floating-symbol:nth-child(13) { animation: floatExtra5 11s infinite; animation-delay: -2s; }
        .floating-symbol:nth-child(14) { animation: floatExtra6 15s infinite; animation-delay: -6s; }
        .floating-symbol:nth-child(15) { animation: floatAround1 13s infinite; animation-delay: -5s; }
        .floating-symbol:nth-child(16) { animation: floatAround2 16s infinite; animation-delay: -8s; }
      `}
    </style>
    
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 1,
      pointerEvents: 'none'
    }}>
      {[
        { left: '52.81%', top: '48.12%', color: '#2E3344', rotate: '-10.79deg' },
        { left: '28.19%', top: '71.22%', color: '#292A2E', rotate: '-37.99deg' },
        { left: '95.09%', top: '48.12%', color: '#ABB5CE', rotate: '34.77deg' },
        { left: '86.46%', top: '15.33%', color: '#2E3344', rotate: '28.16deg' },
        { left: '7.11%', top: '80.91%', color: '#ABB5CE', rotate: '24.5deg' },
        { left: '48.06%', top: '8.5%', color: '#ABB5CE', rotate: '25.29deg' },
        { left: '72.84%', top: '4.42%', color: '#2E3344', rotate: '-19.68deg' },
        { left: '9.6%', top: '0%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '31.54%', top: '54.31%', color: '#6C758E', rotate: '25.29deg' },
        { left: '25.28%', top: '15.89%', color: '#1F232E', rotate: '-6.83deg' },
        { left: '48.55%', top: '82.45%', color: '#292A2E', rotate: '-10.79deg' },
        { left: '24.41%', top: '92.02%', color: '#2E3344', rotate: '18.2deg' },
        { left: '0%', top: '12.8%', color: '#ABB5CE', rotate: '37.85deg' },
        { left: '81.02%', top: '94.27%', color: '#6C758E', rotate: '-37.99deg' },
        { left: '96.02%', top: '0%', color: '#2E3344', rotate: '-37.99deg' },
        { left: '0.07%', top: '41.2%', color: '#6C758E', rotate: '-10.79deg' }
      ].map((pos, i) => (
        <div key={i} className="floating-symbol" style={{
          position: 'absolute',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontStyle: 'normal',
          fontWeight: 900,
          fontSize: '24px',
          lineHeight: '29px',
          userSelect: 'none',
          pointerEvents: 'none',
          left: pos.left,
          top: pos.top,
          color: pos.color,
          transform: `rotate(${pos.rotate})`
        }}>&#60;/&#62;</div>
      ))}
    </div>
  </>
);

function SoloProjectNotes() {
  const { projectId } = useParams();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');

  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const [showCreateNote, setShowCreateNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// NEW STATE: Track sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('soloProjectSidebarCollapsed');
    return saved === 'true';
  });

  // NEW: Function to toggle sidebar
  const toggleSidebar = () => {
    const newCollapsedState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newCollapsedState);
    localStorage.setItem('soloProjectSidebarCollapsed', newCollapsedState.toString());
    
    window.dispatchEvent(new CustomEvent('soloProjectSidebarToggle', {
      detail: { collapsed: newCollapsedState }
    }));
  };

  // NEW: Sync with sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('soloProjectSidebarToggle', handleSidebarToggle);
    return () => window.removeEventListener('soloProjectSidebarToggle', handleSidebarToggle);
  }, []);

  // Fetch notes from API (debounced for search)
  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const filters = {
          sort_by: sortBy,
          sort_order: sortBy === 'title' ? 'asc' : 'desc'
        };
        if (searchTerm.trim()) filters.search = searchTerm.trim();

        const res = await SoloProjectService.getNotes(projectId, filters);
        const apiNotes = res?.data?.data?.notes || res?.data?.notes || [];

        if (!isMounted) return;

        setNotes(apiNotes);

        // Keep selection valid without referencing selectedNote from the closure
        setSelectedNote(prev => {
          const stillExists = prev && apiNotes.some(n => n.id === prev.id);
          if (stillExists) return prev;
          // If previous selection is gone or was null, pick the first note
          setIsEditing(false);
          return apiNotes[0] || null;
        });
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load notes');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [projectId, searchTerm, sortBy]);

  // Server-sorted/filtered list
  const filteredAndSortedNotes = notes;

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    // Optional client-side validation
    const { isValid, errors } = SoloProjectService.validateNoteData(newNote);
    if (!isValid) {
      setError(errors.join(', '));
      return;
    }

    try {
      const res = await SoloProjectService.createNote(projectId, {
        title: newNote.title,
        content: newNote.content,
        category: newNote.category
      });

      const created = res?.data?.data?.note || res?.data?.note;

      if (created) {
        setNotes(prev => [created, ...prev]);
        setSelectedNote(created);
      }

      setNewNote({ title: '', content: '', category: 'general' });
      setShowCreateNote(false);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !selectedNote.title.trim() || !selectedNote.content.trim()) return;

    // Optional validation
    const { isValid, errors } = SoloProjectService.validateNoteData({
      title: selectedNote.title,
      content: selectedNote.content,
      category: selectedNote.category
    });
    if (!isValid) {
      setError(errors.join(', '));
      return;
    }

    try {
      const res = await SoloProjectService.updateNote(
        projectId,
        selectedNote.id,
        {
          title: selectedNote.title,
          content: selectedNote.content,
          category: selectedNote.category
        }
      );

      const updated = res?.data?.data?.note || res?.data?.note;

      if (updated) {
        setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
        setSelectedNote(updated);
      }
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await SoloProjectService.deleteNote(projectId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        const remaining = notes.filter(n => n.id !== noteId);
        setSelectedNote(remaining[0] || null);
        setIsEditing(false);
      }
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete note');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'planning': return <Target size={16} />;
      case 'development': return <Code2 size={16} />;
      case 'learning': return <BookOpen size={16} />;
      case 'ideas': return <Lightbulb size={16} />;
      case 'bugs': return <Bug size={16} />;
      case 'general':
      default: return <StickyNote size={16} />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'planning': return '#3b82f6';
      case 'development': return '#10b981';
      case 'learning': return '#a855f7';
      case 'ideas': return '#f59e0b';
      case 'bugs': return '#ef4444';
      case 'general':
      default: return '#6b7280';
    }
  };

// COMPLETE STYLES ALIGNED WITH PROJECT THEME
const styles = {
  // NEW: Toggle button styles
  toggleButton: {
    position: 'fixed',
    top: '20px',
    left: isSidebarCollapsed ? '100px' : '290px',
    zIndex: 999,  // Changed from 1100 to 999 (modal is at 1000)
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#9ca3af',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  },
  container: {
    minHeight: 'calc(100vh - 40px)',
    backgroundColor: '#0F1116',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px',
    paddingLeft: '120px',  // Adjusted for toggle button
    marginLeft: '0'
  },
  header: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    padding: '0 0 20px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  subtitle: {
    color: '#d1d5db',
    fontSize: '16px',
    margin: '8px 0 0 0'
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
    marginTop: '8px'
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    minHeight: '60vh',
    fontSize: '18px',
    color: '#9ca3af',
    zIndex: 10,
    position: 'relative'
  },
  loadingIcon: {
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '18px',
    color: 'white',
    marginBottom: '8px'
  },
  loadingSubtext: {
    fontSize: '16px',
    color: '#9ca3af'
  },
  errorMessage: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    backdropFilter: 'blur(8px)'
  },
  mainContent: {
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '24px',
    height: 'calc(100vh - 200px)',
    minHeight: '600px'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  sidebarHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    zIndex: 1
  },
  searchInput: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  sortContainer: {
    position: 'relative'
  },
  sortIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    zIndex: 1
  },
  sortSelect: {
    width: '100%',
    padding: '10px 40px 10px 40px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  selectArrow: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none'
  },
  notesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0'
  },
  loadingItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    color: '#9ca3af',
    fontSize: '14px'
  },
  emptyItem: {
    padding: '16px 20px',
    color: '#9ca3af',
    fontSize: '14px',
    textAlign: 'center'
  },
  noteItem: {
    padding: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent'
  },
  noteItemActive: {
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white'
  },
  noteItemHover: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)'
  },
  noteItemHeader: {
    marginBottom: '12px'
  },
  noteItemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'inherit'
  },
  noteItemMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  noteItemFooter: {
    marginBottom: '8px'
  },
  dateText: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    opacity: 0.8
  },
  noteItemPreview: {
    fontSize: '13px',
    margin: 0,
    opacity: 0.7,
    lineHeight: '1.4',
    color: 'inherit'
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  editorHeader: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  editorTitleSection: {
    flex: 1,
    marginRight: '20px'
  },
  editorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 12px 0'
  },
  titleInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '24px',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    margin: '0 0 12px 0'
  },
  editorMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    color: '#d1d5db',
    fontSize: '14px'
  },
  editorActions: {
    display: 'flex',
    gap: '12px'
  },
  actionGroup: {
    display: 'flex',
    gap: '12px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    background: 'linear-gradient(to right, #ef4444, #dc2626)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  editorContent: {
    flex: 1,
    padding: '24px',
    overflow: 'auto'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },
  selectContainer: {
    position: 'relative'
  },
  categorySelect: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  contentTextarea: {
    width: '100%',
    height: '400px',
    padding: '16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
    resize: 'vertical',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#e5e7eb',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  contentDisplay: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#d1d5db',
    whiteSpace: 'pre-wrap',
    padding: '16px 0'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyStateIcon: {
    marginBottom: '24px'
  },
  emptyStateTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 16px 0'
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#9ca3af',
    lineHeight: '1.6',
    maxWidth: '400px',
    margin: 0
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    margin: '20px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))'
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  modalCloseButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modalBody: {
    padding: '24px'
  },
  formInput: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  formSelect: {
    width: '100%',
    padding: '12px 40px 12px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    fontSize: '14px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    appearance: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  formTextarea: {
    width: '100%',
    height: '200px',
    padding: '12px 16px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    resize: 'vertical',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    lineHeight: '1.5',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.90))'
  },
  cancelModalButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    background: '#6b7280'
  }
};

  if (loading) {
    return (
      <>
        {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
        <button
          style={styles.toggleButton}
          onClick={toggleSidebar}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.color = '#3b82f6';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
              e.currentTarget.style.color = '#9ca3af';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <PanelLeft size={20} />
        </button>
        
        <div style={styles.container}>
          <BackgroundSymbols />
          <div style={styles.loadingState}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} className="global-loading-spinner">
              <img 
                src="/images/logo/TechSyncLogo.png" 
                alt="TechSync Logo" 
                style={{
                  width: '125%',
                  height: '125%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <span>Loading Notes...</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Sidebar Toggle Button - OUTSIDE CONTAINER */}
      <button
        style={styles.toggleButton}
        onClick={toggleSidebar}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.color = '#3b82f6';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
          e.currentTarget.style.color = '#9ca3af';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <PanelLeft size={20} />
      </button>
      <div style={styles.container}>
        <BackgroundSymbols />
        
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Project Notes</h1>
            <p style={styles.subtitle}>
              Keep track of your ideas, progress, and important information for your project
            </p>
          </div>
          <button
            style={styles.createButton}
            onClick={() => setShowCreateNote(true)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
            }}
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Note
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorMessage}>
            <AlertTriangle size={16} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarHeader}>
              <div style={styles.searchContainer}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a855f7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={styles.sortContainer}>
                <Filter size={16} style={styles.sortIcon} />
                <select
                  style={styles.sortSelect}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#a855f7';
                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="updated_at">Last Modified</option>
                  <option value="created_at">Date Created</option>
                  <option value="title">Title</option>
                </select>
                <ChevronDown size={16} style={styles.selectArrow} />
              </div>
            </div>
            
            <div style={styles.notesList}>
              {loading && filteredAndSortedNotes.length === 0 ? (
                <div style={styles.loadingItem}>
                  <RefreshCw size={16} style={{ marginRight: '8px', color: '#a855f7' }} />
                  Loading notes...
                </div>
              ) : filteredAndSortedNotes.length === 0 ? (
                <div style={styles.emptyItem}>No notes found</div>
              ) : (
                filteredAndSortedNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      ...styles.noteItem,
                      ...(selectedNote && selectedNote.id === note.id ? styles.noteItemActive : {})
                    }}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedNote || selectedNote.id !== note.id) {
                        Object.assign(e.currentTarget.style, styles.noteItemHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedNote || selectedNote.id !== note.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={styles.noteItemHeader}>
                      <h4 style={styles.noteItemTitle}>{note.title}</h4>
                      <div style={styles.noteItemMeta}>
                        <span
                          style={{
                            ...styles.categoryBadge,
                            backgroundColor: getCategoryColor(note.category),
                            color: 'white'
                          }}
                        >
                          {getCategoryIcon(note.category)}
                          <span style={{ marginLeft: '6px' }}>{note.category}</span>
                        </span>
                      </div>
                    </div>
                    <div style={styles.noteItemFooter}>
                      <span style={styles.dateText}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {formatDate(note.updated_at)}
                      </span>
                    </div>
                    <p style={styles.noteItemPreview}>
                      {(note.content || '').substring(0, 100)}{note.content && note.content.length > 100 ? '...' : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div style={styles.editor}>
            {selectedNote ? (
              <div>
                <div style={styles.editorHeader}>
                  <div style={styles.editorTitleSection}>
                    {isEditing ? (
                      <input
                        style={styles.titleInput}
                        value={selectedNote.title}
                        onChange={(e) => setSelectedNote({
                          ...selectedNote,
                          title: e.target.value
                        })}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#a855f7';
                          e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ) : (
                      <h2 style={styles.editorTitle}>{selectedNote.title}</h2>
                    )}
                    <div style={styles.editorMeta}>
                      <span
                        style={{
                          ...styles.categoryBadge,
                          backgroundColor: getCategoryColor(selectedNote.category),
                          color: 'white'
                        }}
                      >
                        {getCategoryIcon(selectedNote.category)}
                        <span style={{ marginLeft: '6px' }}>{selectedNote.category}</span>
                      </span>
                      <span style={styles.metaItem}>
                        <Calendar size={14} style={{ marginRight: '6px', color: '#9ca3af' }} />
                        {formatDate(selectedNote.updated_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.editorActions}>
                    {isEditing ? (
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.saveButton}
                          onClick={handleUpdateNote}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          <Save size={16} style={{ marginRight: '6px' }} />
                          Save
                        </button>
                        <button
                          style={styles.cancelButton}
                          onClick={() => setIsEditing(false)}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(15, 17, 22, 0.95)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                        >
                          <X size={16} style={{ marginRight: '6px' }} />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.editButton}
                          onClick={() => setIsEditing(true)}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
                          }}
                        >
                          <Edit3 size={16} style={{ marginRight: '6px' }} />
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
                              handleDeleteNote(selectedNote.id);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          <Trash2 size={16} style={{ marginRight: '6px' }} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor Content */}
                <div style={styles.editorContent}>
                  {isEditing ? (
                    <div>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Category</label>
                        <div style={styles.selectContainer}>
                          <select
                            style={styles.categorySelect}
                            value={selectedNote.category}
                            onChange={(e) => setSelectedNote({
                              ...selectedNote,
                              category: e.target.value
                            })}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#a855f7';
                              e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              e.target.style.boxShadow = 'none';
                            }}
                          >
                            <option value="general">General</option>
                            <option value="planning">Planning</option>
                            <option value="development">Development</option>
                            <option value="learning">Learning</option>
                            <option value="ideas">Ideas</option>
                            <option value="bugs">Bugs</option>
                          </select>
                          <ChevronDown size={16} style={styles.selectArrow} />
                        </div>
                      </div>
                      <textarea
                        style={styles.contentTextarea}
                        value={selectedNote.content}
                        onChange={(e) => setSelectedNote({
                          ...selectedNote,
                          content: e.target.value
                        })}
                        placeholder="Write your note content here..."
                        onFocus={(e) => {
                          e.target.style.borderColor = '#a855f7';
                          e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div style={styles.contentDisplay}>{selectedNote.content}</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>
                  <StickyNote size={64} style={{ color: '#a855f7' }} />
                </div>
                <h2 style={styles.emptyStateTitle}>No note selected</h2>
                <p style={styles.emptyStateText}>
                  Choose a note from the sidebar to view it here, or create a new one to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Note Modal */}
        {showCreateNote && (
          <div style={styles.modal} onClick={() => setShowCreateNote(false)}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  <Plus size={24} style={{ marginRight: '12px', color: '#a855f7' }} />
                  Create New Note
                </h2>
                <button
                  style={styles.modalCloseButton}
                  onClick={() => setShowCreateNote(false)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#9ca3af';
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <FileText size={16} style={{ marginRight: '6px' }} />
                    Title *
                  </label>
                  <input
                    style={styles.formInput}
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <Filter size={16} style={{ marginRight: '6px' }} />
                    Category
                  </label>
                  <div style={styles.selectContainer}>
                    <select
                      style={styles.formSelect}
                      value={newNote.category}
                      onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="general">General</option>
                      <option value="planning">Planning</option>
                      <option value="development">Development</option>
                      <option value="learning">Learning</option>
                      <option value="ideas">Ideas</option>
                      <option value="bugs">Bugs</option>
                    </select>
                    <ChevronDown size={16} style={styles.selectArrow} />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>
                    <Edit3 size={16} style={{ marginRight: '6px' }} />
                    Content *
                  </label>
                  <textarea
                    style={styles.formTextarea}
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Write your note content here..."
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  style={styles.cancelModalButton}
                  onClick={() => setShowCreateNote(false)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(15, 17, 22, 0.95)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <X size={16} style={{ marginRight: '6px' }} />
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.submitButton,
                    ...((!newNote.title.trim() || !newNote.content.trim()) ? styles.disabledButton : {})
                  }}
                  onClick={handleCreateNote}
                  disabled={!newNote.title.trim() || !newNote.content.trim()}
                  onMouseEnter={(e) => {
                    if (newNote.title.trim() && newNote.content.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <Check size={16} style={{ marginRight: '6px' }} />
                  Create Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SoloProjectNotes;