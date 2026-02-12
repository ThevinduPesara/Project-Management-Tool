import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Check } from 'lucide-react';

const ReactorDetailsPopover = ({ reaction, currentUserId, onToggle, onClose }) => {
    const hasUserId = reaction.users.find(u =>
        (typeof u === 'object' ? u._id : u) === currentUserId
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="reactor-popover glass-card"
            style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                marginBottom: '10px',
                width: '200px',
                background: 'rgba(30, 30, 45, 0.98)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '0.75rem',
                zIndex: 1000,
                boxShadow: '0 10px 25px rgba(0,0,0,0.4)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{reaction.emoji}</span>
                    <span style={{ fontWeight: '600', color: 'white', fontSize: '0.9rem' }}>Reactors</span>
                </div>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                    <X size={14} />
                </button>
            </div>

            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {reaction.users.map((user, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 0',
                        color: (typeof user === 'object' ? user._id : user) === currentUserId ? 'var(--primary-light)' : 'white',
                        fontSize: '0.85rem'
                    }}>
                        <User size={12} style={{ opacity: 0.6 }} />
                        <span>{typeof user === 'object' ? user.name : 'Someone'}</span>
                        {(typeof user === 'object' ? user._id : user) === currentUserId && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>(You)</span>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(reaction.emoji);
                }}
                style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: hasUserId ? 'rgba(239, 68, 68, 0.2)' : 'var(--primary-main)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                }}
            >
                {hasUserId ? <X size={14} /> : <Check size={14} />}
                {hasUserId ? 'Remove Reaction' : 'Add Reaction'}
            </button>
        </motion.div>
    );
};

const ReactionDisplay = ({ reactions = [], currentUserId, onReact }) => {
    const [selectedEmoji, setSelectedEmoji] = useState(null);
    const containerRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setSelectedEmoji(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!reactions.length) return null;

    return (
        <div className="reactions-display" ref={containerRef} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.35rem',
            marginTop: '0.4rem',
            position: 'relative'
        }}>
            {reactions.map((reaction) => {
                const userId = typeof currentUserId === 'object' ? currentUserId._id : currentUserId;
                const hasReacted = reaction.users.some(u =>
                    (typeof u === 'object' ? u._id : u) === userId
                );

                return (
                    <div key={reaction.emoji} style={{ position: 'relative' }}>
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmoji(selectedEmoji === reaction.emoji ? null : reaction.emoji);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '12px',
                                background: hasReacted ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${hasReacted ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                color: 'white',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            title="Click to see who reacted"
                        >
                            <span>{reaction.emoji}</span>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                opacity: 0.9
                            }}>{reaction.users.length}</span>
                        </motion.button>

                        <AnimatePresence>
                            {selectedEmoji === reaction.emoji && (
                                <ReactorDetailsPopover
                                    reaction={reaction}
                                    currentUserId={userId}
                                    onToggle={onReact}
                                    onClose={() => setSelectedEmoji(null)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export default ReactionDisplay;
