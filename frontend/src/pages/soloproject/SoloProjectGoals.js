// frontend/src/pages/soloproject/SoloProjectGoals.js - ALIGNED WITH DASHBOARD STYLING
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Target, 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  Flag, 
  Folder, 
  BarChart3, 
  Kanban, 
  List, 
  X, 
  Edit, 
  Trash2, 
  AlertCircle, 
  FileText, 
  Code,
  Palette,
  Search,
  BookOpen,
  TestTube,
  Zap,
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

         /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 10px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(26, 28, 32, 0.8);
            border-radius: 5px;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 5px;
            border: 2px solid rgba(26, 28, 32, 0.8);
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }

          * {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.15) rgba(26, 28, 32, 0.8);
          }
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

function SoloProjectGoals() {
  const { projectId } = useParams();
  const location = useLocation();

  // Check if we came here with a specific intent (task vs goal)
  const searchParams = new URLSearchParams(location.search);
  const createIntent = searchParams.get('intent'); // 'task' or 'goal'
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'kanban', 'goals'
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    target_date: '',
    priority: 'medium',
    category: 'feature',
    type: createIntent || 'goal',
    estimated_hours: '',
    task_type: 'development'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  
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

  // Enhanced data fetching with proper progress tracking
  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await SoloProjectService.getGoals(projectId, {
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        const apiItems = res?.data?.goals || [];
        
        // Enhance items with UI-only properties and proper progress tracking
        const enhancedItems = apiItems.map(item => {
          let progress = item.progress || 0;
          if (!item.progress) {
            if (item.status === 'completed') {
              progress = 100;
            } else if (item.status === 'in_progress') {
              progress = 50;
            } else {
              progress = 0;
            }
          }

          return {
            ...item,
            progress: progress,
            type: item.estimated_hours ? 'task' : 'goal'
          };
        });
        
        if (isMounted) setItems(enhancedItems);
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load items');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { isMounted = false; };
  }, [projectId]);

  // ✅ FIXED: Auto-open or close modal based on URL query (works when navigating from dashboard)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const intent = params.get('intent');

    if (intent === 'task' || intent === 'goal') {
      setShowCreateModal(true);
      setNewItem(prev => ({ ...prev, type: intent }));
    } else {
      setShowCreateModal(false); // Close modal if intent param is removed
    }
  }, [location.search]);

  // ✅ NEW: Function to notify dashboard of changes
  const notifyDashboardUpdate = useCallback(async () => {
    try {
      await SoloProjectService.logActivity(projectId, {
        action: 'updated',
        target: 'tasks and goals',
        type: 'project_updated'
      });
      console.log('✅ Dashboard notified of changes');
    } catch (error) {
      console.error('Failed to notify dashboard:', error);
    }
  }, [projectId]);

  // Create item via API
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    try {
      const payload = {
        title: newItem.title,
        description: newItem.description,
        target_date: newItem.target_date || null,
        priority: newItem.priority,
        category: newItem.category,
        ...(newItem.type === 'task' && {
          estimated_hours: parseInt(newItem.estimated_hours) || null
        })
      };

      const res = await SoloProjectService.createGoal(projectId, payload);
      const createdItem = res?.data?.goal;
      
      if (createdItem) {
        const enhancedItem = {
          ...createdItem,
          progress: 0,
          type: newItem.type
        };
        setItems(prev => [enhancedItem, ...prev]);
        await notifyDashboardUpdate();
      }

      // Reset form
      setNewItem({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        category: 'feature',
        type: 'goal',
        estimated_hours: '',
        task_type: 'development'
      });
      setShowCreateModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create item');
    }
  };

  // Enhanced progress tracking that prevents resets
  const updateItemProgress = async (itemId, newProgress) => {
    const originalItem = items.find(item => item.id === itemId);
    
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'active'
        };
      }
      return item;
    }));

    let newStatus = 'active';
    if (newProgress >= 100) {
      newStatus = 'completed';
    } else if (newProgress > 0) {
      newStatus = 'in_progress';
    }

    try {
      const updateData = { 
        status: newStatus,
        progress: newProgress 
      };

      const res = await SoloProjectService.updateGoal(projectId, itemId, updateData);
      const updatedItem = res?.data?.goal;
      
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item, 
            ...updatedItem, 
            progress: newProgress,
            type: item.type
          } : item
        ));
        if (newProgress === 100 || newProgress === 0 || Math.abs(newProgress - (originalItem?.progress || 0)) >= 25) {
          await notifyDashboardUpdate();
        }
      }
    } catch (err) {
      console.error('Progress update failed:', err);
      
      if (originalItem) {
        setItems(prev => prev.map(item => 
          item.id === itemId ? originalItem : item
        ));
      }
      
      alert(err?.response?.data?.message || 'Failed to update progress');
    }
  };

  // Delete item via API
  const deleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await SoloProjectService.deleteGoal(projectId, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      await notifyDashboardUpdate();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete item');
    }
  };

  // Edit item
  const startEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description || '',
      target_date: item.target_date ? item.target_date.split('T')[0] : '',
      priority: item.priority,
      category: item.category,
      type: item.type || 'goal',
      estimated_hours: item.estimated_hours || '',
      task_type: item.task_type || 'development'
    });
    setShowCreateModal(true);
  };

  // Update existing item
  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editingItem || !newItem.title.trim()) return;

    try {
      const payload = {
        title: newItem.title,
        description: newItem.description,
        target_date: newItem.target_date || null,
        priority: newItem.priority,
        category: newItem.category,
        ...(newItem.type === 'task' && {
          estimated_hours: parseInt(newItem.estimated_hours) || null
        })
      };

      const res = await SoloProjectService.updateGoal(projectId, editingItem.id, payload);
      const updatedItem = res?.data?.goal;
      
      if (updatedItem) {
        setItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...updatedItem, type: newItem.type } : item
        ));
        await notifyDashboardUpdate();
      }

      setEditingItem(null);
      setNewItem({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        category: 'feature',
        type: 'goal',
        estimated_hours: '',
        task_type: 'development'
      });
      setShowCreateModal(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update item');
    }
  };

  // Filter items based on active tab and view mode
  const filteredItems = items.filter(item => {
    if (viewMode === 'goals' && item.type !== 'goal') return false;
    
    switch (activeTab) {
      case 'active':
        return ['active', 'in_progress'].includes(item.status);
      case 'completed':
        return item.status === 'completed';
      case 'tasks':
        return item.type === 'task';
      case 'goals':
        return item.type === 'goal';
      case 'overdue':
        return item.target_date && new Date(item.target_date) < new Date() && item.status !== 'completed';
      default:
        return true;
    }
  });

  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'No deadline';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#007bff';
      case 'in_progress': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'paused': return '#ffc107';
      case 'blocked': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'learning': return <BookOpen size={16} />;
      case 'feature': return <Zap size={16} />;
      case 'bug_fix': return <AlertCircle size={16} />;
      case 'optimization': return <BarChart3 size={16} />;
      case 'documentation': return <FileText size={16} />;
      case 'testing': return <TestTube size={16} />;
      default: return <Target size={16} />;
    }
  };

  const getItemStats = () => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const active = items.filter(i => ['active', 'in_progress'].includes(i.status)).length;
    const tasks = items.filter(i => i.type === 'task').length;
    const goals = items.filter(i => i.type === 'goal').length;
    const overdue = items.filter(i =>
      i.target_date &&
      new Date(i.target_date) < new Date() &&
      i.status !== 'completed'
    ).length;

    return { total, completed, active, tasks, goals, overdue };
  };

  const itemStats = getItemStats();

  // Kanban View Component
  const KanbanView = () => {
    const todoItems = filteredItems.filter(i => ['active', 'todo'].includes(i.status));
    const inProgressItems = filteredItems.filter(i => i.status === 'in_progress');
    const completedItems = filteredItems.filter(i => i.status === 'completed');
    const blockedItems = filteredItems.filter(i => i.status === 'blocked');

    const KanbanColumn = ({ title, items: columnItems }) => (
      <div style={styles.kanbanColumn}>
        <div style={styles.kanbanHeader}>
          <h3 style={styles.kanbanTitle}>{title}</h3>
          <span style={styles.kanbanCount}>{columnItems.length}</span>
        </div>
        <div style={styles.kanbanItems}>
          {columnItems.map(item => (
            <ItemCard key={item.id} item={item} isKanban={true} />
          ))}
        </div>
      </div>
    );

    return (
      <div style={styles.kanbanBoard}>
        <KanbanColumn title="To Do" items={todoItems} />
        <KanbanColumn title="In Progress" items={inProgressItems} />
        <KanbanColumn title="Completed" items={completedItems} />
        {blockedItems.length > 0 && (
          <KanbanColumn title="Blocked" items={blockedItems} />
        )}
      </div>
    );
  };

  // Item Card Component
  const ItemCard = ({ item, isKanban = false }) => (
    <div 
      style={{
        ...styles.itemCard,
        ...(isKanban ? styles.kanbanCard : {})
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
      }}
    >
      {/* Header with type and priority */}
      <div style={styles.itemHeader}>
        <div style={styles.itemTypeIndicator}>
          <div style={styles.itemTypeIcon}>
            {item.type === 'task' ? 
              <CheckSquare size={16} style={{ color: '#3b82f6' }} /> : 
              <Target size={16} style={{ color: '#a855f7' }} />
            }
          </div>
          <span style={styles.itemTypeText}>
            {item.type === 'task' ? 'Task' : 'Goal'}
          </span>
        </div>
        <div 
          style={{
            ...styles.priorityBadge,
            backgroundColor: getPriorityColor(item.priority)
          }}
        >
          <AlertCircle size={12} />
          {item.priority}
        </div>
      </div>

      {/* Title */}
      <h3 style={styles.itemTitle}>{item.title}</h3>

      {/* Description */}
      {item.description && (
        <p style={styles.itemDescription}>
          {item.description.length > 150 
            ? `${item.description.substring(0, 150)}...` 
            : item.description}
        </p>
      )}

      {/* Progress Section */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div 
            style={{
              ...styles.progressFill,
              width: `${item.progress || 0}%`
            }}
          />
        </div>
        
        <div style={styles.progressControls}>
          <input
            type="range"
            min="0"
            max="100"
            value={item.progress || 0}
            onChange={(e) => updateItemProgress(item.id, parseInt(e.target.value))}
            style={styles.progressSlider}
          />
          <span style={styles.progressText}>{item.progress || 0}%</span>
        </div>

        <div style={styles.quickProgress}>
          {[0, 25, 50, 75, 100].map(value => (
            <button
              key={value}
              style={{
                ...styles.progressButton,
                ...((item.progress || 0) === value ? styles.progressButtonActive : {})
              }}
              onClick={() => updateItemProgress(item.id, value)}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>

      {/* Meta Information */}
      <div style={styles.itemMeta}>
        <div style={styles.itemDetails}>
          <div style={styles.itemMetaItem}>
            <Calendar size={14} style={{ marginRight: '4px' }} />
            {formatDate(item.target_date)}
          </div>
          <div style={styles.itemCategory}>
            {getCategoryIcon(item.category)}
            <span style={{ marginLeft: '4px' }}>
              {item.category?.replace('_', ' ')}
            </span>
          </div>
          {item.estimated_hours && (
            <div style={styles.itemMetaItem}>
              <Clock size={14} style={{ marginRight: '4px' }} />
              {item.estimated_hours}h estimated
            </div>
          )}
        </div>
      </div>

      {/* Footer with status and actions */}
      <div style={styles.itemFooter}>
        <span 
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(item.status)
          }}
        >
          {item.status?.replace('_', ' ')}
        </span>
        
        <div style={styles.itemActions}>
          <button 
            style={styles.editButton}
            onClick={() => startEditItem(item)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <Edit size={12} style={{ marginRight: '4px' }} />
            Edit
          </button>
          <button 
            style={styles.deleteButton}
            onClick={() => deleteItem(item.id)}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
              e.target.style.color = '#dc2626';
            }}
          >
            <Trash2 size={12} style={{ marginRight: '4px' }} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
  // COMPLETE STYLES ALIGNED WITH DASHBOARD
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
    marginBottom: '32px'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 0 20px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: 'linear-gradient(to right, #a855f7, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
  },
  viewToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(20px)'
  },
  viewButtonActive: {
    backgroundColor: '#a855f7',
    color: 'white',
    borderColor: '#a855f7'
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af'
  },
  filterTabs: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterTab: {
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(20px)'
  },
  filterTabActive: {
    backgroundColor: '#a855f7',
    color: 'white',
    borderColor: '#a855f7'
  },
  content: {
    position: 'relative',
    zIndex: 10,
    marginBottom: '24px'
  },
  itemGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  itemCard: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '20px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  kanbanBoard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    minHeight: '500px'
  },
  kanbanColumn: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '16px',
    backdropFilter: 'blur(20px)'
  },
  kanbanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  kanbanTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    margin: 0
  },
  kanbanCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#9ca3af',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  kanbanItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  kanbanCard: {
    margin: 0
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  itemTypeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  itemTypeIcon: {
    display: 'flex',
    alignItems: 'center'
  },
  itemTypeText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'uppercase'
  },
  priorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  itemTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    margin: '0 0 12px 0'
  },
  itemDescription: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 16px 0',
    lineHeight: '1.5'
  },
  progressSection: {
    marginBottom: '16px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a855f7, #7c3aed)',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  progressControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px'
  },
  progressSlider: {
    flex: 1,
    height: '6px',
    appearance: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer'
  },
  progressText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#9ca3af',
    minWidth: '40px'
  },
  quickProgress: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap'
  },
  progressButton: {
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  progressButtonActive: {
    backgroundColor: '#a855f7',
    color: 'white',
    borderColor: '#a855f7'
  },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  itemMetaItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9ca3af'
  },
  itemCategory: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500'
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  statusBadge: {
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  itemActions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#9ca3af',
    gridColumn: '1 / -1'
  },
  emptyStateIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyStateText: {
    fontSize: '18px',
    marginBottom: '16px'
  },
  emptyStateButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: '#a855f7',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    margin: '0 auto'
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
  errorMessage: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    textAlign: 'center',
    backdropFilter: 'blur(8px)'
  },
  
  // MODAL STYLES - ALIGNED WITH DASHBOARD THEME
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.98), rgba(15, 17, 22, 0.95))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(20px)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '32px 32px 24px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))'
  },
  modalTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    margin: 0
  },
  closeButton: {
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
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    maxHeight: 'calc(90vh - 220px)'
  },
  typeToggle: {
    display: 'flex',
    gap: '12px',
    margin: '24px 32px',
    padding: '6px',
    backgroundColor: 'rgba(15, 17, 22, 0.8)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid transparent',
    padding: '16px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  typeButtonActive: {
    backgroundColor: '#a855f7',
    color: 'white',
    borderColor: '#a855f7',
    boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.1)'
  },
  formContainer: {
    padding: '0 32px 24px 32px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px'
  },
  formLabel: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '8px'
  },
  formInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white'
  },
  formTextarea: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5',
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: 'white'
  },
  taskSpecificFields: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid rgba(59, 130, 246, 0.2)'
  },
  goalSpecificFields: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '2px solid rgba(168, 85, 247, 0.2)'
  },
  goalNote: {
    fontSize: '15px',
    color: '#a855f7',
    margin: 0,
    fontStyle: 'italic',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    padding: '24px 32px 32px 32px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.95), rgba(15, 17, 22, 0.90))'
  },
  cancelButton: {
    backgroundColor: 'rgba(26, 28, 32, 0.95)',
    color: '#9ca3af',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '120px'
  },
  cancelButtonHover: {
    backgroundColor: 'rgba(15, 17, 22, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  submitButton: {
    backgroundColor: '#a855f7',
    color: 'white',
    border: '2px solid #a855f7',
    padding: '14px 28px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: '160px',
    boxShadow: '0 4px 6px -1px rgba(168, 85, 247, 0.1)'
  },
  submitButtonHover: {
    backgroundColor: '#7c3aed',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 15px -3px rgba(168, 85, 247, 0.2)'
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
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
            <span>Loading Tasks & Goals...</span>
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
        {/* Background Code Symbols */}
        <BackgroundSymbols />

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h1 style={styles.title}>Tasks & Goals</h1>
            <button 
              style={styles.createButton}
              onClick={() => setShowCreateModal(true)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(147, 51, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.3)';
              }}
            >
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Item
            </button>
          </div>

          {/* View Mode Toggle */}
          <div style={styles.viewToggle}>
            <button 
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.viewButtonActive : {})
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={16} style={{ marginRight: '6px' }} />
              List
            </button>
            <button 
              style={{
                ...styles.viewButton,
                ...(viewMode === 'kanban' ? styles.viewButtonActive : {})
              }}
              onClick={() => setViewMode('kanban')}
            >
              <Kanban size={16} style={{ marginRight: '6px' }} />
              Kanban
            </button>
            <button 
              style={{
                ...styles.viewButton,
                ...(viewMode === 'goals' ? styles.viewButtonActive : {})
              }}
              onClick={() => setViewMode('goals')}
            >
              <Target size={16} style={{ marginRight: '6px' }} />
              Goals Focus
            </button>
          </div>

          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <CheckSquare size={14} style={{ marginRight: '4px', color: '#3b82f6' }} />
              {itemStats.tasks} Tasks
            </div>
            <div style={styles.statItem}>
              <Target size={14} style={{ marginRight: '4px', color: '#a855f7' }} />
              {itemStats.goals} Goals
            </div>
            <div style={styles.statItem}>
              <BarChart3 size={14} style={{ marginRight: '4px', color: '#10b981' }} />
              {itemStats.completed} Completed
            </div>
            <div style={styles.statItem}>
              <Zap size={14} style={{ marginRight: '4px', color: '#f59e0b' }} />
              {itemStats.active} Active
            </div>
            {itemStats.overdue > 0 && (
              <div style={{...styles.statItem, color: '#dc3545'}}>
                <AlertCircle size={14} style={{ marginRight: '4px', color: '#dc3545' }} />
                {itemStats.overdue} Overdue
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {[
            { key: 'all', label: 'All Items', count: itemStats.total },
            { key: 'active', label: 'Active', count: itemStats.active },
            { key: 'completed', label: 'Completed', count: itemStats.completed },
            { key: 'tasks', label: 'Tasks Only', count: itemStats.tasks },
            { key: 'goals', label: 'Goals Only', count: itemStats.goals },
            ...(itemStats.overdue > 0 ? [{ key: 'overdue', label: 'Overdue', count: itemStats.overdue }] : [])
          ].map(tab => (
            <button
              key={tab.key}
              style={{
                ...styles.filterTab,
                ...(activeTab === tab.key ? styles.filterTabActive : {})
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorMessage}>
            <AlertCircle size={16} style={{ marginRight: '8px' }} />
            {error}
          </div>
        )}

        {/* Main Content */}
        <div style={styles.content}>
          {viewMode === 'kanban' ? (
            <KanbanView />
          ) : (
            <div style={styles.itemGrid}>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyStateIcon}>
                    {activeTab === 'tasks' ? 
                      <CheckSquare size={48} style={{ opacity: 0.5 }} /> : 
                      activeTab === 'goals' ? 
                      <Target size={48} style={{ opacity: 0.5 }} /> : 
                      <BarChart3 size={48} style={{ opacity: 0.5 }} />
                    }
                  </div>
                  <div style={styles.emptyStateText}>
                    No {activeTab === 'all' ? 'items' : activeTab} found
                  </div>
                  <button 
                    style={styles.emptyStateButton}
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={16} style={{ marginRight: '8px' }} />
                    Create your first {activeTab === 'tasks' ? 'task' : activeTab === 'goals' ? 'goal' : 'item'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div style={styles.modal} onClick={() => {
            setShowCreateModal(false);
            setEditingItem(null);
            setNewItem({
              title: '',
              description: '',
              target_date: '',
              priority: 'medium',
              category: 'feature',
              type: 'goal',
              estimated_hours: '',
              task_type: 'development'
            });
          }}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>
                  {editingItem ? 'Edit' : 'Create'} {newItem.type === 'task' ? 'Task' : 'Goal'}
                </h2>
                <button 
                  style={styles.closeButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body with scrollable content */}
              <div style={styles.modalBody}>
                {/* Type Toggle */}
                <div style={styles.typeToggle}>
                  <button
                    type="button"
                    style={{
                      ...styles.typeButton,
                      ...(newItem.type === 'task' ? styles.typeButtonActive : {})
                    }}
                    onClick={() => setNewItem({...newItem, type: 'task'})}
                  >
                    <CheckSquare size={16} />
                    Task
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.typeButton,
                      ...(newItem.type === 'goal' ? styles.typeButtonActive : {})
                    }}
                    onClick={() => setNewItem({...newItem, type: 'goal'})}
                  >
                    <Target size={16} />
                    Goal
                  </button>
                </div>

                {/* Form Container */}
                <div style={styles.formContainer}>
                  <form onSubmit={editingItem ? handleUpdateItem : handleCreateItem}>
                    {/* Title Field */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Title *</label>
                      <input
                        style={styles.formInput}
                        type="text"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder={`Enter ${newItem.type} title`}
                        required
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

                    {/* Description Field */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Description</label>
                      <textarea
                        style={styles.formTextarea}
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder={`Describe your ${newItem.type}...`}
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

                    {/* Priority and Category Row */}
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Priority</label>
                        <select
                          style={styles.formInput}
                          value={newItem.priority}
                          onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.formLabel}>Category</label>
                        <select
                          style={styles.formInput}
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        >
                          <option value="learning">Learning</option>
                          <option value="feature">Feature</option>
                          <option value="bug_fix">Bug Fix</option>
                          <option value="optimization">Optimization</option>
                          <option value="documentation">Documentation</option>
                          <option value="testing">Testing</option>
                        </select>
                      </div>
                    </div>

                    {/* Task-specific Fields */}
                    {newItem.type === 'task' && (
                      <div style={styles.taskSpecificFields}>
                        <div style={styles.formRow}>
                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Task Type</label>
                            <select
                              style={styles.formInput}
                              value={newItem.task_type}
                              onChange={(e) => setNewItem({ ...newItem, task_type: e.target.value })}
                            >
                              <option value="development">Development</option>
                              <option value="design">Design</option>
                              <option value="research">Research</option>
                              <option value="planning">Planning</option>
                              <option value="testing">Testing</option>
                              <option value="documentation">Documentation</option>
                            </select>
                          </div>

                          <div style={styles.formGroup}>
                            <label style={styles.formLabel}>Estimated Hours</label>
                            <input
                              style={styles.formInput}
                              type="number"
                              value={newItem.estimated_hours}
                              onChange={(e) => setNewItem({ ...newItem, estimated_hours: e.target.value })}
                              placeholder="0"
                              min="0"
                              step="0.5"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Goal-specific Fields */}
                    {newItem.type === 'goal' && (
                      <div style={styles.goalSpecificFields}>
                        <p style={styles.goalNote}>
                          <Target size={16} />
                          Goals are tracked with progress updates and focus on long-term objectives
                        </p>
                      </div>
                    )}

                    {/* Target Date */}
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>
                        {newItem.type === 'task' ? 'Due Date' : 'Target Date'}
                      </label>
                      <input
                        style={styles.formInput}
                        type="date"
                        value={newItem.target_date}
                        onChange={(e) => setNewItem({ ...newItem, target_date: e.target.value })}
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingItem(null);
                  }}
                  onMouseEnter={(e) => Object.assign(e.target.style, styles.cancelButtonHover)}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(26, 28, 32, 0.95)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(newItem.title.trim() ? {} : styles.submitButtonDisabled)
                  }}
                  onClick={editingItem ? handleUpdateItem : handleCreateItem}
                  disabled={!newItem.title.trim()}
                  onMouseEnter={(e) => {
                    if (newItem.title.trim()) {
                      Object.assign(e.target.style, styles.submitButtonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newItem.title.trim()) {
                      e.target.style.backgroundColor = '#a855f7';
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(168, 85, 247, 0.1)';
                    }
                  }}
                >
                  {editingItem ? 'Update' : 'Create'} {newItem.type === 'task' ? 'Task' : 'Goal'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SoloProjectGoals;