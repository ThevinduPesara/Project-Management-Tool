import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { Plus, Sparkles, MessageCircle, TrendingDown } from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import AIPlanner from '../components/AIPlanner';
import ChatRoom from '../components/ChatRoom';
import BurndownChart from '../components/BurndownChart';

const GroupDetails = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('board');
    const [currentUserId, setCurrentUserId] = useState(null);

    const fetchDetails = async () => {
        try {
            const groupRes = await api.get('/groups/my-groups');
            const found = groupRes.data.find(g => g._id === groupId);
            setGroup(found);

            const taskRes = await api.get(`/tasks/group/${groupId}`);
            setTasks(taskRes.data);

            // Get current user ID from token
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.user.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [groupId]);

    const updateGithubRepo = async (githubRepo) => {
        try {
            await api.put(`/groups/${groupId}/github`, { githubRepo });
            fetchDetails();
        } catch (err) {
            console.error(err);
            alert('Failed to update GitHub repository');
        }
    };

    const updateTimeline = async (startDate, endDate) => {
        try {
            await api.put(`/groups/${groupId}/timeline`, { startDate, endDate });
            fetchDetails();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Failed to update project timeline';
            alert(msg);
        }
    };

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

    const isLeader = group.leader === currentUserId;

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

                        <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                            {/* GitHub Repo Link */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                                <span style={{ opacity: 0.7 }}>🔗</span>
                                {group.githubRepo ? (
                                    <>
                                        <a
                                            href={`https://github.com/${group.githubRepo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'none', fontWeight: '500' }}
                                        >
                                            github.com/{group.githubRepo}
                                        </a>
                                        {isLeader && (
                                            <button
                                                onClick={() => {
                                                    const repo = prompt('Enter GitHub Repo (owner/repo):', group.githubRepo);
                                                    if (repo !== null) updateGithubRepo(repo);
                                                }}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.75rem' }}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    isLeader && (
                                        <button
                                            onClick={() => {
                                                const repo = prompt('Enter GitHub Repo (owner/repo):');
                                                if (repo) updateGithubRepo(repo);
                                            }}
                                            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            + Link GitHub
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Timeline Dates */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <span style={{ opacity: 0.7 }}>📅</span>
                                <span>
                                    {new Date(group.startDate).toLocaleDateString()} - {group.endDate ? new Date(group.endDate).toLocaleDateString() : 'Set Deadline'}
                                </span>
                                {isLeader && (
                                    <button
                                        onClick={() => {
                                            const parseInput = (str) => {
                                                if (!str) return null;
                                                const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                                                if (match) {
                                                    const [_, d, m, y] = match;
                                                    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                                }
                                                return str;
                                            };
                                            const start = prompt('Enter Start Date (YYYY-MM-DD):', group.startDate.split('T')[0]);
                                            const end = prompt('Enter Milestone/End Date (YYYY-MM-DD):', group.endDate?.split('T')[0] || '');
                                            if (start !== null || end !== null) {
                                                updateTimeline(parseInput(start), parseInput(end));
                                            }
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Member stats... */}
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
                        onClick={() => setActiveTab('analytics')}
                        style={{ fontSize: '1.25rem', borderBottom: activeTab === 'analytics' ? '2px solid var(--primary-light)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', color: activeTab === 'analytics' ? 'white' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <TrendingDown size={18} color="var(--primary-light)" /> Analytics
                    </h2>
                    <h2
                        onClick={() => setActiveTab('planner')}
                        style={{ fontSize: '1.25rem', borderBottom: activeTab === 'planner' ? '2px solid var(--primary-light)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', color: activeTab === 'planner' ? 'white' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Sparkles size={18} color="var(--primary-light)" /> AI Planner
                    </h2>
                    <h2
                        onClick={() => setActiveTab('chat')}
                        style={{ fontSize: '1.25rem', borderBottom: activeTab === 'chat' ? '2px solid var(--primary-light)' : 'none', paddingBottom: '0.5rem', cursor: 'pointer', color: activeTab === 'chat' ? 'white' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <MessageCircle size={18} color="var(--primary-light)" /> Chat
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
            ) : activeTab === 'analytics' ? (
                <BurndownChart groupId={groupId} />
            ) : activeTab === 'planner' ? (
                <AIPlanner groupId={groupId} onPlanApplied={() => { setActiveTab('board'); fetchDetails(); }} />
            ) : (
                <ChatRoom
                    groupId={groupId}
                    currentUserId={currentUserId}
                    members={group.members}
                    leader={group.leader}
                />
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
