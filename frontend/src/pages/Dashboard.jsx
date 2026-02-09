import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { motion } from 'framer-motion';
import {
    Users, Plus, Layout, CheckCircle, UserPlus,
    Settings, Folder, ClipboardList, Briefcase,
    AlertCircle, Clock, Search
} from 'lucide-react';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import StatsCard from '../components/StatsCard';
import TaskCard from '../components/TaskCard';
import TeamContributions from '../components/TeamContributions';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/dashboard/summary');
                console.log('Dashboard summary data:', res.data);
                setSummary(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ color: 'var(--primary-light)' }}>
                <Clock size={40} />
            </motion.div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your projects today.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn-outline"
                        onClick={() => setIsJoinModalOpen(true)}
                    >
                        Join Group
                    </button>
                    <button
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={18} /> New Project
                    </button>
                </div>
            </header>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <StatsCard title="Active Projects" value={summary?.activeProjects || 0} icon={Briefcase} color="#6366f1" />
                <StatsCard title="Total Tasks" value={summary?.totalTasks || 0} icon={ClipboardList} color="#10b981" />
                <StatsCard title="In Progress" value={summary?.inProgressTasks || 0} icon={Clock} color="#f59e0b" />
                <StatsCard title="Overdue" value={summary?.overdueTasks || 0} icon={AlertCircle} color="#ef4444" />
            </div>

            {/* Overall Progress */}
            {summary && (
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontWeight: 'bold' }}>Overall Project Progress</h3>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-light)' }}>
                                {summary.totalTasks > 0 ? Math.round(((summary.totalTasks - summary.inProgressTasks - summary.overdueTasks) / summary.totalTasks) * 100) : 0}%
                            </span>
                        </div>
                        <div style={{ height: '10px', background: 'var(--bg-main)', borderRadius: '5px', overflow: 'hidden' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${summary.totalTasks > 0 ? ((summary.totalTasks - summary.inProgressTasks - summary.overdueTasks) / summary.totalTasks) * 100 : 0}%` }}
                                transition={{ duration: 1 }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary-light), var(--secondary))' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Lower Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', flex: 1 }}>
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Tasks</h3>
                        <button style={{ color: 'var(--text-muted)', fontSize: '0.875rem', background: 'transparent', padding: 0 }}>View All</button>
                    </div>
                    <div style={{ flex: 1 }}>
                        {summary?.recentTasks?.map(task => (
                            <TaskCard key={task._id} task={task} />
                        ))}
                        {summary?.recentTasks?.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No recent tasks</p>
                        )}
                    </div>
                </div>

                <TeamContributions members={summary?.teamContributions || []} />
            </div>

            <CreateGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGroupCreated={() => window.location.reload()}
            />
            <JoinGroupModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                onGroupJoined={() => window.location.reload()}
            />
        </div>
    );
};

export default Dashboard;
