import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Briefcase, Users, Plus, UserPlus, ArrowRight } from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';

const Projects = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups/my-groups');
                setGroups(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) return <div style={{ color: 'white' }}>Loading projects...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Projects</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your university projects and group assignments.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" onClick={() => setIsJoinOpen(true)}>
                        <UserPlus size={18} /> Join Group
                    </button>
                    <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>
                        <Plus size={18} /> New Project
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {groups.map((group, index) => (
                    <motion.div
                        key={group._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card project-card"
                        onClick={() => navigate(`/group/${group._id}`)}
                        style={{ cursor: 'pointer', padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'var(--primary-light)', padding: '0.75rem', borderRadius: '12px' }}>
                                <Briefcase size={24} color="white" />
                            </div>
                            <div className="status-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                Active
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>{group.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', flex: 1 }}>{group.description}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Users size={16} color="var(--text-muted)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{group.members?.length || 0} Members</span>
                            </div>
                            <ArrowRight size={20} color="var(--primary-light)" className="arrow-icon" />
                        </div>
                    </motion.div>
                ))}

                {groups.length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                        <Briefcase size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No projects yet</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Create a new group or join one with an invite code to get started.</p>
                        <button className="btn-primary" onClick={() => setIsCreateOpen(true)}>Create Your First Project</button>
                    </div>
                )}
            </div>

            <CreateGroupModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onGroupCreated={() => window.location.reload()} />
            <JoinGroupModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} onGroupJoined={() => window.location.reload()} />
        </div>
    );
};

export default Projects;
