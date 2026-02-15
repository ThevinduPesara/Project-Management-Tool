import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Users, UserPlus, Settings, Shield, Search, TrendingUp, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        fetchData();
    }, [groupId]);

    const fetchData = async () => {
        try {
            const [membersRes, activityRes] = await Promise.all([
                api.get(`/admin/${groupId}/members`),
                api.get(`/activity/${groupId}`)
            ]);
            setMembers(membersRes.data);
            setActivityLogs(activityRes.data.logs);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching admin data:', err);
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.put(`/admin/${groupId}/role`, { userId, newRole });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to update role');
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get(`/admin/search-users?query=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleSendInvite = async (email) => {
        try {
            await api.post(`/invitations/send/${groupId}`, { email });
            alert('Invitation sent!');
            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            alert(err.response?.data?.msg || 'Failed to send invite');
        }
    };

    if (loading) return <div className="loading">Loading Admin Dashboard...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <button
                onClick={() => navigate(`/group/${groupId}`)}
                className="btn-secondary"
                style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
                <ArrowLeft size={18} /> Back to Group
            </button>

            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Group Administration</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage members, roles, and track group activity.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Member Management */}
                <section>
                    <div className="glass-card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <Users color="var(--primary-light)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Manage Members</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {members.map((member) => (
                                <div key={member.user._id} className="member-row" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{member.user.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{member.user.email}</div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            background: member.role === 'leader' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                                            color: member.role === 'leader' ? '#facc15' : 'var(--primary-light)'
                                        }}>
                                            {member.role.toUpperCase()}
                                        </div>

                                        {member.role !== 'leader' && (
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                                                className="glass-input"
                                                style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto' }}
                                            >
                                                <option value="member">Member</option>
                                                <option value="task-manager">Task Manager</option>
                                                <option value="viewer">Viewer</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <UserPlus color="var(--primary-light)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Invite New Members</h2>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                            <input
                                type="text"
                                className="glass-input"
                                placeholder="Search users by name or skill..."
                                style={{ paddingLeft: '3rem' }}
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {searchResults.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {searchResults.map(user => (
                                    <div key={user._id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.skills.join(', ')}</div>
                                        </div>
                                        <button
                                            onClick={() => handleSendInvite(user.email)}
                                            className="btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                        >
                                            Invite
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Right Column: Activity Feed */}
                <section>
                    <div className="glass-card" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <TrendingUp color="var(--primary-light)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Recent Activity</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {activityLogs.map((log) => (
                                <div key={log._id} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{
                                        width: '2px',
                                        background: 'var(--primary-light)',
                                        opacity: 0.3,
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '-4px',
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-light)'
                                        }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.875rem' }}>
                                            <span style={{ fontWeight: '600' }}>{log.user.name}</span>
                                            <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        {log.details?.taskTitle && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', marginTop: '0.2rem' }}>
                                                "{log.details.taskTitle}"
                                            </div>
                                        )}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
