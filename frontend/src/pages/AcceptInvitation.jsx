import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const AcceptInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [groupId, setGroupId] = useState(null);

    useEffect(() => {
        const acceptInvite = async () => {
            try {
                const res = await api.get(`/invitations/accept/${token}`);
                setStatus('success');
                setMessage(res.data.msg);
                setGroupId(res.data.groupId);

                // Redirect after 3 seconds
                setTimeout(() => {
                    navigate(`/group/${res.data.groupId}`);
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.msg || 'Failed to accept invitation');
            }
        };

        acceptInvite();
    }, [token, navigate]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ textAlign: 'center', maxWidth: '400px', width: '90%' }}
            >
                {status === 'loading' && (
                    <>
                        <Loader className="animate-spin" size={48} color="var(--primary-light)" style={{ margin: '0 auto 1.5rem' }} />
                        <h2>Processing Invitation...</h2>
                        <p style={{ color: 'var(--text-muted)' }}>We're adding you to the team.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ color: '#10b981' }}>Success!</h2>
                        <p>{message}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                            Redirecting you to the group dashboard...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
                        <h2 style={{ color: '#ef4444' }}>Invitation Error</h2>
                        <p>{message}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-primary"
                            style={{ marginTop: '1.5rem' }}
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default AcceptInvitation;
