import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { User, Settings as SettingsIcon, Bell, Shield, LogOut, Calendar } from 'lucide-react';
import calendarService from '../api/calendarService';

const Settings = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const [name, setName] = React.useState(user?.name || '');
    const [githubUsername, setGithubUsername] = React.useState(user?.githubUsername || '');
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setName(user.name || '');
            setGithubUsername(user.githubUsername || '');
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/auth/profile', { name, githubUsername });
            await refreshUser();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Profile update error:', error);
            const msg = error.response?.data?.msg || error.response?.data?.message || 'Failed to update profile';
            alert(`Error: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleCalendarSync = async () => {
        try {
            const res = await calendarService.syncDeadlines();
            alert(res.message);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to sync calendar');
        }
    };

    const handleConnect = async () => {
        try {
            const { url } = await calendarService.getAuthUrl();
            window.location.href = url;
        } catch (error) {
            alert('Failed to get connection URL');
        }
    };

    const isConnected = user?.googleRefreshToken || new URLSearchParams(window.location.search).get('calendar') === 'connected';

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your account preferences and personal information.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Profile Section */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.name}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: '#818cf8',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                fontWeight: 'bold',
                                marginTop: '0.5rem',
                                display: 'inline-block'
                            }}>
                                {user?.role || 'Student'}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                className="glass-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                            <input type="email" className="glass-input" defaultValue={user?.email} disabled style={{ width: '100%', opacity: 0.7 }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>GitHub Username</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>github.com/</span>
                            <input
                                type="text"
                                className="glass-input"
                                value={githubUsername}
                                onChange={(e) => setGithubUsername(e.target.value)}
                                placeholder="username"
                                style={{ flex: 1 }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Used to track your code contributions.</p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={saving}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        {saving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                </motion.div>

                {/* Integrations Section */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Integrations</h3>
                    <div
                        onClick={handleCalendarSync}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px' }}
                    >
                        <Calendar size={24} color="#4285F4" />
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: 'bold' }}>Google Calendar</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {isConnected ? 'Your account is connected.' : 'Sync your task deadlines automatically.'}
                            </p>
                        </div>
                        {isConnected ? (
                            <button onClick={handleCalendarSync} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Sync Now</button>
                        ) : (
                            <button onClick={handleConnect} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Connect</button>
                        )}
                    </div>
                </div>
                <SettingRow icon={Bell} title="Notifications" desc="Manage how you receive updates and reminders." />
                <SettingRow icon={Shield} title="Privacy & Security" desc="Control your account security and data visibility." />
                <SettingRow icon={SettingsIcon} title="General Preferences" desc="Adjust language, theme, and region settings." />

                <button
                    onClick={logout}
                    className="btn-outline"
                    style={{
                        marginTop: '1rem',
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <LogOut size={18} /> Logout from Account
                </button>
            </div>
        </div>
    );
};

const SettingRow = ({ icon: Icon, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}
    >
        <div style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '12px', color: 'var(--primary-light)' }}>
            <Icon size={20} />
        </div>
        <div>
            <h4 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{desc}</p>
        </div>
    </motion.div>
);

export default Settings;
