import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Settings as SettingsIcon, Bell, Shield, LogOut } from 'lucide-react';

const Settings = () => {
    const { user, logout } = useContext(AuthContext);

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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input type="text" className="glass-input" defaultValue={user?.name} style={{ width: '100%' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email Address</label>
                            <input type="email" className="glass-input" defaultValue={user?.email} disabled style={{ width: '100%', opacity: 0.7 }} />
                        </div>
                    </div>
                </motion.div>

                {/* Other Settings Placeholder sections */}
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
