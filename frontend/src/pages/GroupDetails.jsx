import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import AIPlanner from '../components/AIPlanner';

const GroupDetails = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('board');

    const fetchDetails = async () => {
        try {
            const groupRes = await api.get('/groups/my-groups');
            const found = groupRes.data.find(g => g._id === groupId);
            setGroup(found);

            const taskRes = await api.get(`/tasks/group/${groupId}`);
            setTasks(taskRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [groupId]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
            setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading details...</div>;
    if (!group) return <div style={{ color: 'white', padding: '2rem' }}>Group not found.</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{group.name}</h1>
                        <p style={{ color: 'var(--text-dim)' }}>{group.description}</p>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem', minWidth: '250px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {group.members.slice(0, 5).map((member, i) => (
                                        <div key={member._id} style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: 'var(--primary-light)',
                                            border: '2px solid var(--bg-main)',
                                            marginLeft: i === 0 ? 0 : '-8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            fontSize: '0.6rem',
                                            color: 'white',
                                            zIndex: 5 - i
                                        }}>
                                            {member.name.charAt(0)}
                                        </div>
                                    ))}
                                    {group.members.length > 5 && (
                                        <div style={{ marginLeft: '-8px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                                            +{group.members.length - 5}
                                        </div>
                                    )}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{group.members.length} members</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <code style={{ flex: 1, fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '4px', textAlign: 'center' }}>{group.inviteCode}</code>
                                <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <h2
                        onClick={() => setActiveTab('board')}
                        style={{ fontSize: '1.25rem', borderBottom: activeTab === 'board' ? '2px solid var(--primary-light)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', color: activeTab === 'board' ? 'white' : 'var(--text-dim)' }}
                    >
                        Kanban Board
                    </h2>
                    <h2
                        onClick={() => setActiveTab('planner')}
                        style={{ fontSize: '1.25rem', borderBottom: activeTab === 'planner' ? '2px solid var(--primary-light)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', color: activeTab === 'planner' ? 'white' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Sparkles size={18} color="var(--primary-light)" /> AI Planner
                    </h2>
                </div>
                {activeTab === 'board' && (
                    <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> New Work Item
                    </button>
                )}
            </div>

            {activeTab === 'board' ? (
                <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
            ) : (
                <AIPlanner groupId={groupId} onPlanApplied={() => { setActiveTab('board'); fetchDetails(); }} />
            )}

            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                groupId={groupId}
                members={group.members}
                onTaskCreated={fetchDetails}
            />
        </div>
    );
};

export default GroupDetails;
