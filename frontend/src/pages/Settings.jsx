import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { User, Settings as SettingsIcon, Bell, Shield, LogOut, Calendar, X, Award } from 'lucide-react';
import calendarService from '../api/calendarService';

const Settings = () => {
    const { user, logout, refreshUser } = useContext(AuthContext);
    const [name, setName] = React.useState(user?.name || '');
    const [githubUsername, setGithubUsername] = React.useState(user?.githubUsername || '');
    const [skills, setSkills] = React.useState(user?.skills || []);
    const [newSkill, setNewSkill] = React.useState('');
    const [emailEnabled, setEmailEnabled] = React.useState(user?.emailDigestEnabled ?? true);
    const [frequency, setFrequency] = React.useState(user?.emailDigestFrequency || 'daily');
    const [pushEnabled, setPushEnabled] = React.useState(user?.pushNotificationsEnabled ?? true);
    const [emailEnabledNotifications, setEmailEnabledNotifications] = React.useState(user?.emailNotificationsEnabled ?? true);
    const [saving, setSaving] = React.useState(false);
    const [sendingTest, setSendingTest] = React.useState(false);
    const [activeModal, setActiveModal] = React.useState(null);

    // Form states for password change
    const [passwordForm, setPasswordForm] = React.useState({ current: '', new: '', confirm: '' });
    const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'system');

    React.useEffect(() => {
        const applyTheme = (t) => {
            if (t === 'system') {
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', t);
            }
            localStorage.setItem('theme', t);
        };

        applyTheme(theme);

        // Listen for system theme changes if in system mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    React.useEffect(() => {
        if (user) {
            setName(user.name || '');
            setGithubUsername(user.githubUsername || '');
            setSkills(user.skills || []);
            setEmailEnabled(user.emailDigestEnabled ?? true);
            setFrequency(user.emailDigestFrequency || 'daily');
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            let finalSkills = [...skills];
            if (newSkill.trim() && !finalSkills.includes(newSkill.trim())) {
                finalSkills.push(newSkill.trim());
                setSkills(finalSkills);
                setNewSkill('');
            }
            
            await api.put('/auth/profile', {
                name,
                githubUsername,
                skills: finalSkills,
                emailDigestEnabled: emailEnabled,
                emailDigestFrequency: frequency
            });
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

    const addSkill = (e) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            e.preventDefault();
            if (!skills.includes(newSkill.trim())) {
                setSkills([...skills, newSkill.trim()]);
            }
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleSendTest = async () => {
        setSendingTest(true);
        try {
            const res = await api.post('/auth/test-digest');
            alert(res.data.msg);
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to send test email');
        } finally {
            setSendingTest(false);
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.new !== passwordForm.confirm) {
            alert('New passwords do not match');
            return;
        }

        setSaving(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            });
            alert('Password updated successfully!');
            setActiveModal(null);
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (error) {
            alert(error.response?.data?.msg || 'Failed to update password');
        } finally {
            setSaving(false);
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

                    {/* Skills Management */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Award size={16} color="var(--primary-light)" />
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Your Skills & Expertise</label>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {skills.map(skill => (
                                <span key={skill} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    {skill}
                                    <X
                                        size={14}
                                        style={{ cursor: 'pointer', opacity: 0.6 }}
                                        onClick={() => removeSkill(skill)}
                                    />
                                </span>
                            ))}
                            {skills.length === 0 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No skills added yet.</p>
                            )}
                        </div>
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Add a skill (e.g. React, Node.js) and press Enter"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={addSkill}
                            style={{ width: '100%' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>These skills help the AI Planner assign tasks that match your expertise.</p>
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

                {/* Email Digest Preferences Section */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '12px', color: 'var(--primary-light)' }}>
                            <Bell size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Email Digest Notifications</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Stay updated with personalized project summaries.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{emailEnabled ? 'Enabled' : 'Disabled'}</span>
                            <input
                                type="checkbox"
                                checked={emailEnabled}
                                onChange={(e) => setEmailEnabled(e.target.checked)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    {emailEnabled && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Frequency</label>
                                <select
                                    className="glass-input"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="daily">Daily Digest (8:00 AM)</option>
                                    <option value="weekly">Weekly Wrap-up (Mon 9:00 AM)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                <button
                                    onClick={handleSendTest}
                                    disabled={sendingTest}
                                    className="btn-outline"
                                    style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
                                >
                                    {sendingTest ? 'Sending...' : 'Send Test Email'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

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
                            <button onClick={(e) => { e.stopPropagation(); handleCalendarSync(); }} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Sync Now</button>
                        ) : (
                            <button onClick={(e) => { e.stopPropagation(); handleConnect(); }} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Connect</button>
                        )}
                    </div>
                </div>

                <SettingRow icon={Bell} title="Notifications" desc="Manage how you receive updates and reminders." onClick={() => setActiveModal('notifications')} />
                <SettingRow icon={Shield} title="Privacy & Security" desc="Control your account security and data visibility." onClick={() => setActiveModal('privacy')} />
                <SettingRow icon={SettingsIcon} title="General Preferences" desc="Adjust language, theme, and region settings." onClick={() => setActiveModal('preferences')} />

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

            {/* Notifications Modal */}
            <AnimatePresence>
                {activeModal === 'notifications' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: 'auto', position: 'relative' }}>
                            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Notification Settings</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 'bold' }}>Push Notifications</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Receive alerts in your browser</p>
                                    </div>
                                    <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 'bold' }}>Email Alerts</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Receive important updates via email</p>
                                    </div>
                                    <input type="checkbox" checked={emailEnabledNotifications} onChange={(e) => setEmailEnabledNotifications(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                                </div>
                                <button className="btn-primary" onClick={handleSave} style={{ marginTop: '1rem', padding: '0.75rem' }}>Save Changes</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Privacy Modal */}
            <AnimatePresence>
                {activeModal === 'privacy' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: 'auto', position: 'relative' }}>
                            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Change Password</h2>
                            <form onSubmit={handlePasswordChange}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <input required type="password" placeholder="Current Password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="glass-input" style={{ width: '100%' }} />
                                    <input required type="password" placeholder="New Password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="glass-input" style={{ width: '100%' }} />
                                    <input required type="password" placeholder="Confirm New Password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="glass-input" style={{ width: '100%' }} />
                                </div>
                                <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', padding: '0.75rem' }}>{saving ? 'Updating...' : 'Update Password'}</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Preferences Modal */}
            <AnimatePresence>
                {activeModal === 'preferences' && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: 'auto', position: 'relative' }}>
                            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={24} /></button>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>General Preferences</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Interface Language</label>
                                    <select className="glass-input" style={{ width: '100%' }}>
                                        <option>English (US)</option>
                                        <option>English (UK)</option>
                                        <option>French</option>
                                        <option>Spanish</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Theme Mode</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button 
                                            className={theme === 'system' ? "btn-primary" : "btn-outline"} 
                                            style={{ flex: 1, padding: '0.5rem' }}
                                            onClick={() => setTheme('system')}
                                        >
                                            System
                                        </button>
                                        <button 
                                            className={theme === 'dark' ? "btn-primary" : "btn-outline"} 
                                            style={{ flex: 1, padding: '0.5rem' }}
                                            onClick={() => setTheme('dark')}
                                        >
                                            Dark
                                        </button>
                                        <button 
                                            className={theme === 'light' ? "btn-primary" : "btn-outline"} 
                                            style={{ flex: 1, padding: '0.5rem' }}
                                            onClick={() => setTheme('light')}
                                        >
                                            Light
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Timezone</label>
                                    <select className="glass-input" style={{ width: '100%' }}>
                                        <option>GMT+05:30 (Mumbai, Kolkata)</option>
                                        <option>UTC (London)</option>
                                        <option>GMT-05:00 (New York)</option>
                                    </select>
                                </div>
                                <button className="btn-primary" onClick={() => setActiveModal(null)} style={{ marginTop: '0.5rem', padding: '0.75rem' }}>Done</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SettingRow = ({ icon: Icon, title, desc, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
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
