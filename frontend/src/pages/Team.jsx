import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, User } from 'lucide-react';

const Team = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.get('/groups/my-groups');
                setGroups(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    // Extract unique members from all groups
    const membersMap = new Map();
    groups.forEach(group => {
        group.members.forEach(member => {
            if (!membersMap.has(member._id)) {
                membersMap.set(member._id, {
                    ...member,
                    groups: [group.name],
                    isLeader: member._id === group.leader
                });
            } else {
                const existing = membersMap.get(member._id);
                existing.groups.push(group.name);
                if (member._id === group.leader) existing.isLeader = true;
            }
        });
    });

    const uniqueMembers = Array.from(membersMap.values());

    if (loading) return <div style={{ color: 'white' }}>Loading team...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Team Directory</h1>
                <p style={{ color: 'var(--text-muted)' }}>All researchers and students you are collaborating with across your projects.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {uniqueMembers.map((member, index) => (
                    <motion.div
                        key={member._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card"
                        style={{ padding: '1.5rem' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                {member.name.charAt(0)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{member.name}</h3>
                                    {member.isLeader && <Shield size={14} color="var(--secondary)" />}
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <Mail size={12} /> {member.email}
                                </p>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Projects</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                {member.groups.map((groupName, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.7rem',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        color: '#818cf8',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '4px'
                                    }}>
                                        {groupName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}

                {uniqueMembers.length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                        <User size={48} color="var(--text-muted)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No teammates yet</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Join a group to see your teammates here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
