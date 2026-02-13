import React, { useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Upload, Check, Loader2, User, AlertCircle } from 'lucide-react';

const AIPlanner = ({ groupId, onPlanApplied }) => {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [applying, setApplying] = useState(false);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('text', text);
        formData.append('groupId', groupId);

        try {
            const res = await api.post('/ai/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPlan(res.data);
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.msg || 'Make sure your API key is set in the backend and you have restarted the server.';
            alert('Analysis failed: ' + errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post('/ai/confirm', { groupId, suggestedTasks: plan });
            setPlan(null);
            onPlanApplied();
            alert('Project plan applied successfully!');
        } catch (err) {
            console.error(err);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            {!plan ? (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--primary-light)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Sparkles color="white" size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>AI Project Planner</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Upload your project brief or PDF, and I'll generate a full task plan for your team.</p>
                    </div>

                    <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', position: 'relative' }}>
                            <Upload size={32} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{file ? file.name : "Click to upload PDF brief"}</p>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                            />
                        </div>

                        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>OR</div>

                        <textarea
                            className="glass-input"
                            placeholder="Describe your project goals, features, and requirements..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{ minHeight: '150px', width: '100%' }}
                        />

                        <button
                            disabled={loading || (!file && !text)}
                            type="submit"
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                            {loading ? "Analyzing Project Brief..." : "Generate AI Plan"}
                        </button>
                    </form>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Proposed Project Plan</h2>
                            <p style={{ color: 'var(--text-muted)' }}>I've identified {plan.length} core tasks and assigned them to your team.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-outline" onClick={() => setPlan(null)}>Discard</button>
                            <button className="btn-primary" onClick={handleApply} disabled={applying}>
                                {applying ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                                {applying ? "Creating Tasks..." : "Apply this Plan"}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {plan.map((task, i) => (
                            <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'var(--bg-main)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: task.type === 'Bug' ? '#ef4444' : task.type === 'Story' ? 'var(--secondary)' : 'var(--primary-light)'
                                }}>
                                    <FileText size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{task.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{task.description}</p>
                                    {task.assignedToName && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--primary-light)', fontSize: '0.8rem' }}>
                                            <User size={14} />
                                            Assigned to: {task.assignedToName}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>TYPE</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{task.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AIPlanner;
