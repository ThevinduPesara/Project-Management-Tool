import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import api from '../api/axios';

const QAModal = ({ isOpen, onClose, task, onVerified }) => {
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleVerify = async () => {
        if (!note.trim()) return alert('Please provide a submission note.');
        setLoading(true);
        try {
            const res = await api.post('/qa/verify', { taskId: task._id, submissionNote: note });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('AI verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDone = async () => {
        try {
            await api.patch(`/tasks/${task._id}/status`, { status: 'Done' });
            onVerified(task._id, 'Done');
            onClose();
        } catch (err) {
            console.error(err);
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
                    <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={24} color="var(--primary-light)" /> Submit for Review
                    </h2>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Submission Note</label>
                        <textarea
                            className="glass-input"
                            style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                            placeholder="Describe what you completed and how you met the requirements..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {!result ? (
                        <button
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleVerify}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            AI Verify Requirements
                        </button>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: result.verdict === 'PASS' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${result.verdict === 'PASS' ? '#10b981' : '#ef4444'}`,
                                marginBottom: '1.5rem'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: result.verdict === 'PASS' ? '#10b981' : '#ef4444' }}>
                                    {result.verdict === 'PASS' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    <strong style={{ textTransform: 'uppercase' }}>AI Verdict: {result.verdict}</strong>
                                </div>
                                <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>{result.feedback}</p>
                                {result.suggestions && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <strong>Suggestion:</strong> {result.suggestions}
                                    </p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-outline" style={{ flex: 1 }} onClick={() => setResult(null)}>Retry</button>
                                {result.verdict === 'PASS' && (
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleConfirmDone}>Move to Done</button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QAModal;
