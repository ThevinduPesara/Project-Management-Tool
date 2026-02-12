import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { TrendingDown, Calendar, AlertCircle, Zap } from 'lucide-react';

const BurndownChart = ({ groupId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBurndown = async () => {
            try {
                const res = await api.get(`/dashboard/burndown/${groupId}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching burndown:', err);
                setError('Failed to load chart data');
                setLoading(false);
            }
        };

        if (groupId) fetchBurndown();
    }, [groupId]);

    if (loading) return (
        <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader">Loading Analytics...</div>
        </div>
    );

    if (error || !data) return (
        <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <AlertCircle size={24} style={{ marginRight: '10px' }} />
            {error || 'No data available'}
        </div>
    );

    const { timeline, stats } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: '2rem', marginBottom: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <TrendingDown className="text-primary" />
                        Burndown Chart
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Project progress vs ideal timeline</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="stat-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                        <Zap size={14} style={{ marginRight: '5px' }} />
                        Velocity: {stats.velocity} tasks/day
                    </div>
                </div>
            </div>

            <div style={{ height: '350px', width: '100%', marginBottom: '2rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-dim)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-dim)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Tasks Remaining', angle: -90, position: 'insideLeft', style: { fill: 'var(--text-dim)', fontSize: '12px' } }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                color: '#fff'
                            }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Area
                            type="monotone"
                            dataKey="ideal"
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            fillOpacity={1}
                            fill="url(#colorIdeal)"
                            name="Ideal Progress"
                        />
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            name="Actual Progress"
                            connectNulls={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', color: '#818cf8' }}>
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted Finish</p>
                        <h4 style={{ fontWeight: 'bold' }}>{stats.predictedEndDate}</h4>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        padding: '0.75rem',
                        background: stats.isOnTrack ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        color: stats.isOnTrack ? '#4ade80' : '#f87171'
                    }}>
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</p>
                        <h4 style={{ fontWeight: 'bold', color: stats.isOnTrack ? '#4ade80' : '#f87171' }}>
                            {stats.isOnTrack ? 'On Track' : 'Falling Behind'}
                        </h4>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining</p>
                        <h4 style={{ fontWeight: 'bold' }}>{stats.remainingTasks} Tasks</h4>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default BurndownChart;
