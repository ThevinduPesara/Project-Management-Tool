import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, Briefcase, CheckCircle, AlertCircle, Search } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/tasks/my-tasks');
                setTasks(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Done': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
            case 'In Progress': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
            default: return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
        }
    };

    if (loading) return <div style={{ color: 'white' }}>Loading tasks...</div>;

    const filteredTasks = tasks.filter(task => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.group?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.status?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Tasks</h1>
                <p style={{ color: 'var(--text-muted)' }}>A centralized view of all tasks assigned to you across all your projects.</p>
                
                <div style={{ position: 'relative', marginTop: '1.5rem', maxWidth: '400px' }}>
                    <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search tasks by title, project, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            background: 'var(--bg-main, white)',
                            color: 'var(--text-main, #1e293b)',
                            fontSize: '0.95rem',
                            outline: 'none',
                        }}
                    />
                </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredTasks.map((task, index) => {
                    const style = getStatusStyle(task.status);
                    return (
                        <motion.div
                            key={task._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="glass-card"
                            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: style.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {task.status === 'Done' ? <CheckCircle color={style.color} size={24} /> :
                                    task.status === 'In Progress' ? <Clock color={style.color} size={24} /> :
                                        <AlertCircle color={style.color} size={24} />}
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{task.title}</h3>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '4px',
                                        background: 'var(--bg-main)',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        <Briefcase size={12} /> {task.group?.name}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{task.description}</p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    color: style.color,
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.25rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {task.status}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                                    <Clock size={12} /> {new Date(task.deadline).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {filteredTasks.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '5rem' }}>
                        <ClipboardList size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                            {tasks.length === 0 ? "No tasks assigned" : "No tasks found"}
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {tasks.length === 0 
                                ? "Relax! You don't have any tasks assigned to you at the moment."
                                : "No tasks match your search query."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTasks;
