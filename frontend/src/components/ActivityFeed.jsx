import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, Briefcase } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return '#10b981';
            case 'In Progress': return '#f59e0b';
            case 'To Do': return '#64748b';
            default: return 'var(--primary-light)';
        }
    };

    return (
        <div className="glass-card" style={{ height: '100%', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--primary-light)" /> Recent Activity
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {activities.map((activity, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{ display: 'flex', gap: '1rem', position: 'relative' }}
                    >
                        {/* Timeline Line */}
                        {index !== activities.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                left: '15px',
                                top: '30px',
                                bottom: '-20px',
                                width: '2px',
                                background: 'var(--bg-main)',
                                zIndex: 0
                            }} />
                        )}

                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1,
                            border: '2px solid var(--border)'
                        }}>
                            <User size={14} color="var(--text-muted)" />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{activity.updatedBy?.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {new Date(activity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                moved <span style={{ color: 'white', fontWeight: '500' }}>{activity.taskTitle}</span>
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    background: 'rgba(100, 116, 139, 0.1)',
                                    color: getStatusColor(activity.from),
                                    border: `1px solid ${getStatusColor(activity.from)}22`
                                }}>{activity.from}</span>
                                <ArrowRight size={12} color="var(--text-muted)" />
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: getStatusColor(activity.to),
                                    border: `1px solid ${getStatusColor(activity.to)}22`
                                }}>{activity.to}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                <Briefcase size={10} /> {activity.groupName}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {activities.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <p>No recent activity tracked yet.</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Status changes will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
