import React, { useState } from 'react';
import api from '../api/axios';

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups/create', { name, description });
            onGroupCreated(res.data);
            onClose();
        } catch (err) {
            alert('Error creating group');
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="gradient-text" style={{ marginBottom: '1.5rem' }}>New Group</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Group Name</label>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="e.g. Project Phoenix"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>Description</label>
                        <textarea
                            className="glass-input"
                            placeholder="What is this group about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ minHeight: '100px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Group</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
