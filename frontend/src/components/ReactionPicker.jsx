import React from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

const ReactionPicker = ({ onSelect, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="reaction-picker glass-card"
            style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.4rem',
                borderRadius: '30px',
                background: 'rgba(30, 30, 45, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 100,
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
        >
            {EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '50%',
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.4)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    {emoji}
                </button>
            ))}
        </motion.div>
    );
};

export default ReactionPicker;
