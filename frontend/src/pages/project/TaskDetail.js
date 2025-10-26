import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import CommentsContainer from '../../components/Comments/CommentsContainer';

const TaskDetail = () => {
    const { projectId, taskId } = useParams();
    const navigate = useNavigate();
    
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Use useCallback to fix dependency warnings
    const fetchTaskData = useCallback(async () => {
        try {
            const response = await taskService.getTask(projectId, taskId);
            setTask(response.data.task);
            setEditForm(response.data.task);
        } catch (error) {
            console.error('Error fetching task:', error);
            setError('Failed to load task details');
        }
    }, [projectId, taskId]);

    const fetchProjectData = useCallback(async () => {
        try {
            // Fetch project details
            const projectResponse = await projectService.getProjectById(projectId);
            setProject(projectResponse.data.project);

            // Fetch project members 
            try {
                const membersResponse = await projectService.getProjectMembers(projectId);
                setProjectMembers(membersResponse.data.members || []);
            } catch (memberError) {
                console.log('Could not fetch project members:', memberError);
                setProjectMembers([]);
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId && taskId) {
            fetchTaskData();
            fetchProjectData();
        }
    }, [projectId, taskId, fetchTaskData, fetchProjectData]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await taskService.updateTask(projectId, taskId, editForm);
            setTask(response.data.task);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            console.log('🔄 Updating task status to:', newStatus);
            
            const response = await taskService.updateTask(projectId, taskId, {
                status: newStatus
            });

            if (response && response.data && response.data.task) {
                setTask(response.data.task);
                console.log('✅ Task status updated successfully');
            }

        } catch (error) {
            console.error('💥 Error updating status:', error);
            alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        const colors = {
            'todo': '#6c757d',
            'in_progress': '#007bff',
            'in_review': '#ffc107',
            'completed': '#28a745',
            'blocked': '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        };
        return colors[priority] || '#6c757d';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <h2>Loading task details...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>Error: {error}</h2>
                <button onClick={() => navigate(`/project/${projectId}/tasks`)}>
                    Back to Tasks
                </button>
            </div>
        );
    }

    if (!task) {
        return (
            <div style={styles.errorContainer}>
                <h2>Task not found</h2>
                <button onClick={() => navigate(`/project/${projectId}/tasks`)}>
                    Back to Tasks
                </button>
            </div>
        );
    }

    // Get project owner from project data for mentions
    const projectOwner = project ? {
        id: project.owner_id,
        full_name: project.users?.full_name,
        username: project.users?.username,
        email: project.users?.email,
        avatar_url: project.users?.avatar_url
    } : null;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button 
                    style={styles.backButton}
                    onClick={() => navigate(`/project/${projectId}/tasks`)}
                >
                    ← Back to Tasks
                </button>
                
                {!isEditing && (
                    <button
                        style={styles.editButton}
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Task
                    </button>
                )}
            </div>

            <div style={styles.content}>
                <div style={styles.taskSection}>
                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} style={styles.editForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={editForm.title || ''}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status</label>
                                    <select
                                        name="status"
                                        value={editForm.status || 'todo'}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="completed">Completed</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Priority</label>
                                    <select
                                        name="priority"
                                        value={editForm.priority || 'medium'}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    name="description"
                                    value={editForm.description || ''}
                                    onChange={handleInputChange}
                                    placeholder="Describe the task..."
                                    style={styles.textarea}
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Estimated Hours</label>
                                    <input
                                        type="number"
                                        name="estimated_hours"
                                        value={editForm.estimated_hours || ''}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        min="0"
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Due Date</label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={editForm.due_date ? 
                                            new Date(editForm.due_date).toISOString().split('T')[0] : ''}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.formActions}>
                                <button type="submit" style={styles.saveButton}>
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            <h1 style={styles.title}>{task.title}</h1>
                            
                            <div style={styles.metaInfo}>
                                <div style={styles.badges}>
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: getStatusColor(task.status),
                                        color: task.status === 'in_review' ? '#000' : '#fff'
                                    }}>
                                        {task.status?.replace('_', ' ')}
                                    </span>
                                    
                                    <span style={{
                                        ...styles.badge,
                                        backgroundColor: getPriorityColor(task.priority)
                                    }}>
                                        {task.priority} priority
                                    </span>
                                </div>

                                <div style={styles.statusButtons}>
                                    <button
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: '#6c757d'
                                        }}
                                        onClick={() => handleStatusChange('todo')}
                                    >
                                        To Do
                                    </button>
                                    <button
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: '#007bff'
                                        }}
                                        onClick={() => handleStatusChange('in_progress')}
                                    >
                                        In Progress
                                    </button>
                                    <button
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: '#ffc107',
                                            color: '#000'
                                        }}
                                        onClick={() => handleStatusChange('in_review')}
                                    >
                                        In Review
                                    </button>
                                    <button
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: '#28a745'
                                        }}
                                        onClick={() => handleStatusChange('completed')}
                                    >
                                        Completed
                                    </button>
                                    <button
                                        style={{
                                            ...styles.statusButton,
                                            backgroundColor: '#dc3545'
                                        }}
                                        onClick={() => handleStatusChange('blocked')}
                                    >
                                        Blocked
                                    </button>
                                </div>
                            </div>

                            {task.description && (
                                <div style={styles.description}>
                                    <h3>Description</h3>
                                    <p style={styles.descriptionText}>{task.description}</p>
                                </div>
                            )}

                            <div style={styles.taskMeta}>
                                <div style={styles.metaItem}>
                                    <strong>Task Type:</strong> {task.task_type || 'Development'}
                                </div>
                                <div style={styles.metaItem}>
                                    <strong>Created:</strong> {formatDate(task.created_at)}
                                </div>
                                {task.due_date && (
                                    <div style={styles.metaItem}>
                                        <strong>Due Date:</strong> {formatDate(task.due_date)}
                                    </div>
                                )}
                                {task.estimated_hours && (
                                    <div style={styles.metaItem}>
                                        <strong>Estimated Hours:</strong> {task.estimated_hours}
                                    </div>
                                )}
                                {task.assigned_user && (
                                    <div style={styles.metaItem}>
                                        <strong>Assigned to:</strong> {task.assigned_user.full_name}
                                    </div>
                                )}
                                {task.creator && (
                                    <div style={styles.metaItem}>
                                        <strong>Created by:</strong> {task.creator.full_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div style={styles.commentsSection}>
                    <CommentsContainer 
                        taskId={taskId}
                        projectMembers={projectMembers}
                        projectOwner={projectOwner}
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e1e5e9'
    },
    backButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    editButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    content: {
        display: 'grid',
        gap: '32px'
    },
    taskSection: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    commentsSection: {
        // Comments container will have its own styling
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 16px 0'
    },
    metaInfo: {
        marginBottom: '24px'
    },
    badges: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    statusButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    statusButton: {
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500'
    },
    description: {
        marginBottom: '24px'
    },
    descriptionText: {
        lineHeight: '1.6',
        color: '#495057',
        fontSize: '16px',
        whiteSpace: 'pre-wrap'
    },
    taskMeta: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px',
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px'
    },
    metaItem: {
        fontSize: '14px',
        color: '#495057'
    },
    // Edit form styles
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    label: {
        marginBottom: '5px',
        fontWeight: '500',
        color: '#333'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        resize: 'vertical',
        minHeight: '100px'
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
    },
    saveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '60px',
        color: '#6c757d'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px',
        color: '#dc3545'
    }
};

export default TaskDetail;