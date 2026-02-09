import React, { useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, AlignLeft, BarChart, Sparkles } from 'lucide-react';
import aiService from '../api/aiService';

const CreateTaskModal = ({ isOpen, onClose, groupId, members, onTaskCreated }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedTo: '',
        type: 'Task'
    });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const handleAiEstimate = async () => {
        if (!taskData.title) return alert('Please enter a title first');
        setAiLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await aiService.estimateDifficulty({
                title: taskData.title,
                description: taskData.description
            }, token);

            console.log("AI Response:", res);
            // Assuming response has { difficulty: "Medium", emoji: "😐", estimatedHours: 4 }
            alert(`AI Estimate: ${res.difficulty} ${res.emoji}`);
            // You could auto-fill difficulty field if it existed in the form, 
            // but for now we just show it.
        } catch (error) {
            console.error(error);
            alert('AI Estimation failed');
        } finally {
            setAiLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/tasks', { ...taskData, groupId });
            onTaskCreated();
            setTaskData({ title: '', description: '', deadline: '', assignedTo: '', type: 'Task' });
            onClose();
        } catch (err) {
            console.error(err);
            alert('Error creating task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay" style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card"
                    style={{ width: '100%', maxWidth: '550px', padding: '2rem', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>New Work Item</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Define a new piece of work for your team.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Title</label>
                            <input
                                required
                                type="text"
                                className="glass-input"
                                placeholder="What needs to be done?"
                                value={taskData.title}
                                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleAiEstimate}
                            disabled={aiLoading}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.5rem 1rem',
                                color: 'white',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                width: 'fit-content',
                                cursor: 'pointer',
                                marginTop: '-1rem'
                            }}
                        >
                            <Sparkles size={14} />
                            {aiLoading ? 'Analyzing...' : 'AI Estimate Difficulty'}
                        </button>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description</label>
                            <div style={{ position: 'relative' }}>
                                <AlignLeft size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
                                <textarea
                                    className="glass-input"
                                    placeholder="Provide more details..."
                                    value={taskData.description}
                                    onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                                    style={{ width: '100%', minHeight: '100px', paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Work Item Type</label>
                                <select
                                    className="glass-input"
                                    value={taskData.type}
                                    onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                                    style={{ width: '100%' }}
                                >
                                    <option value="Task">Task (Technical)</option>
                                    <option value="Story">Story (Feature)</option>
                                    <option value="Bug">Bug (Issue)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Deadline</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                    <input
                                        required
                                        type="date"
                                        className="glass-input"
                                        value={taskData.deadline}
                                        onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
                                        style={{ width: '100%', paddingLeft: '3rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Assign To</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <select
                                    className="glass-input"
                                    value={taskData.assignedTo}
                                    onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
                                    style={{ width: '100%', paddingLeft: '3rem' }}
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn-primary"
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Creating...' : <>Create Work Item</>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateTaskModal;
