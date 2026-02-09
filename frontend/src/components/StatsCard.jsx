import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                minWidth: '200px'
            }}
        >
            <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>{title}</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
            </div>
            <div style={{
                background: `${color}15`,
                padding: '0.75rem',
                borderRadius: '0.75rem',
                color: color
            }}>
                <Icon size={24} />
            </div>
        </motion.div>
    );
};

export default StatsCard;
