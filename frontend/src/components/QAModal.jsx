import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, ClipboardCheck, Send, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const QAModal = ({ isOpen, onClose, task, onVerified, isLeader }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setNote(task.submissionNote || '');
        }
    }, [task]);

    const handleSubmitForReview = async () => {
        if (!note.trim()) return alert('Please provide a submission note.');
        setLoading(true);
        try {
            // First save the note (We might need an endpoint or use status update if it accepts notes)
            // Existing status update doesn't accept notes, so we might need to update the backend route
            // For now, let's assume we can pass it or we'll update the backend in next step
            await api.patch(`/tasks/${task._id}/status`, {
                status: 'Under Review',
                submissionNote: note
            });
            onVerified(task._id, 'Under Review');
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || err.response?.data?.error || 'Failed to submit for review';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setLoading(true);
        try {
            await api.patch(`/tasks/${task._id}/status`, { status: 'Done' });
            onVerified(task._id, 'Done');
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Failed to approve task';
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestChanges = async () => {
        setLoading(true);
        try {
            await api.patch(`/tasks/${task._id}/status`, { status: 'In Progress' });
            onVerified(task._id, 'In Progress');
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to request changes');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal-overlay">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card"
                    style={{ width: '500px', padding: '2rem', position: 'relative' }}
                >
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {isLeader ? (
                            <><ClipboardCheck size={28} color="var(--primary-light)" /> Review Task</>
                        ) : (
                            <><Send size={24} color="var(--primary-light)" /> Submit Work</>
                        )}
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{task.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{task.description}</p>

                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            {isLeader ? "Member's Submission Note" : "Your Submission Note"}
                        </label>
                        {isLeader ? (
                            <div style={{
                                padding: '1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                border: '1px solid var(--border)',
                                minHeight: '80px',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {task.submissionNote || "No note provided."}
                            </div>
                        ) : (
                            <textarea
                                className="glass-input"
                                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                                placeholder="Describe what you completed and how you met the requirements..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {isLeader ? (
                            <>
                                <button
                                    className="btn-outline"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={handleRequestChanges}
                                    disabled={loading}
                                >
                                    <ArrowLeft size={18} /> Needs Changes
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={handleApprove}
                                    disabled={loading}
                                >
                                    <CheckCircle size={18} /> Approve & Done
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn-outline" style={{ flex: 1 }} onClick={onClose} disabled={loading}>Cancel</button>
                                <button
                                    className="btn-primary"
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={handleSubmitForReview}
                                    disabled={loading}
                                >
                                    <Send size={18} /> Submit for Review
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QAModal;
