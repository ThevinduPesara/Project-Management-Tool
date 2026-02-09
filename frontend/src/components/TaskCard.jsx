import React from 'react';
import { Calendar, User, Clock } from 'lucide-react';

const TaskCard = ({ task }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'var(--success)';
            case 'In Progress': return 'var(--primary-light)';
            default: return 'var(--text-muted)';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{
            padding: '1.25rem',
            background: 'var(--bg-main)',
            borderRadius: '0.75rem',
            border: '1px solid var(--border)',
            marginBottom: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: '600', fontSize: '1rem' }}>{task.title}</h4>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '1rem',
                    background: `${getStatusColor(task.status)}15`,
                    color: getStatusColor(task.status),
                    fontWeight: '600',
                    border: `1px solid ${getStatusColor(task.status)}30`
                }}>
                    {task.status}
                </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {task.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={14} />
                        {formatDate(task.deadline)}
                    </div>
                    {task.assignedTo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={14} />
                            {task.assignedTo.name}
                        </div>
                    )}
                </div>
                {task.group && (
                    <div style={{ fontWeight: '500', color: 'var(--primary-light)' }}>
                        {task.group.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
