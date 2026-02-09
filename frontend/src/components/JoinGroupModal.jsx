import React, { useState } from 'react';
import api from '../api/axios';

const JoinGroupModal = ({ isOpen, onClose, onGroupJoined }) => {
    const [inviteCode, setInviteCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups/join', { inviteCode });
            onGroupJoined(res.data);
            onClose();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error joining group');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="gradient-text" style={{ marginBottom: '1.5rem' }}>Join Group</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>Enter the invite code provided by your group leader.</p>
                    <input
                        type="text"
                        className="glass-input"
                        placeholder="A1B2C3D4"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        required
                        style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '4px' }}
                    />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Join Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinGroupModal;
