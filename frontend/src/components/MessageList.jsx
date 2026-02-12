import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, File, Download, Image as ImageIcon, ExternalLink } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import ReactionDisplay from './ReactionDisplay';

const MessageList = ({ messages, currentUserId, typingUsers = [], members = [], onReact }) => {
    const messagesEndRef = useRef(null);
    const [activePickerId, setActivePickerId] = useState(null);
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDateSeparator = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    };

    const shouldShowDateSeparator = (currentMsg, previousMsg) => {
        if (!previousMsg) return true;

        const currentDate = new Date(currentMsg.timestamp).toDateString();
        const previousDate = new Date(previousMsg.timestamp).toDateString();

        return currentDate !== previousDate;
    };

    const shouldGroupMessage = (currentMsg, previousMsg) => {
        if (!previousMsg) return false;

        const isSameSender = currentMsg.sender._id === previousMsg.sender._id;
        const timeDiff = new Date(currentMsg.timestamp) - new Date(previousMsg.timestamp);
        const isWithin5Mins = timeDiff < 300000; // 5 minutes

        return isSameSender && isWithin5Mins;
    };

    // Replace @mention patterns with styled spans
    const renderContent = (content) => {
        const mentionRegex = /(@\w+)/g;
        if (!content) return null;
        const parts = content.split(mentionRegex);

        return parts.map((part, i) => {
            if (part && part.match && part.match(mentionRegex)) {
                return (
                    <span key={i} className="message-mention">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="message-attachments" style={{
                marginTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {attachments.map((file, idx) => {
                    const isImage = file.mimeType.startsWith('image/');
                    const fileUrl = `${API_BASE}${file.url}`;

                    if (isImage) {
                        return (
                            <a
                                key={idx}
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    maxWidth: '100%',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <img
                                    src={fileUrl}
                                    alt={file.originalName}
                                    style={{
                                        maxWidth: '300px',
                                        maxHeight: '400px',
                                        width: '100%',
                                        display: 'block',
                                        objectFit: 'contain'
                                    }}
                                />
                            </a>
                        );
                    }

                    return (
                        <div key={idx} className="file-attachment glass-card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            maxWidth: '250px'
                        }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-light)'
                            }}>
                                <File size={20} />
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    color: 'white',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {file.originalName}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                    {(file.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                            <a
                                href={fileUrl}
                                download={file.originalName}
                                style={{
                                    color: 'var(--text-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.4rem',
                                    borderRadius: '4px',
                                    transition: 'color 0.2s',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-dim)'}
                            >
                                <Download size={18} />
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Get user name from ID
    const getUserName = (userId) => {
        const member = members.find(m => m._id === userId);
        return member ? member.name : 'Someone';
    };

    return (
        <div className="message-list">
            <AnimatePresence>
                {messages.map((msg, index) => {
                    const isOwnMessage = msg.sender._id === currentUserId;
                    const showDateSeparator = shouldShowDateSeparator(msg, messages[index - 1]);
                    const isGrouped = shouldGroupMessage(msg, messages[index - 1]);

                    return (
                        <React.Fragment key={msg._id}>
                            {showDateSeparator && (
                                <div className="date-separator">
                                    <span>{getDateSeparator(msg.timestamp)}</span>
                                </div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
                                style={{
                                    marginTop: isGrouped ? '0.25rem' : '1rem',
                                    position: 'relative'
                                }}
                            >
                                {!isOwnMessage && !isGrouped && (
                                    <div className="message-sender">
                                        <div className="sender-avatar">
                                            {msg.sender.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="sender-name">{msg.sender.name}</span>
                                    </div>
                                )}

                                <div className="message-bubble-wrapper" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                                    position: 'relative'
                                }}>
                                    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                                        <div className="message-content">
                                            {renderContent(msg.content)}
                                            {renderAttachments(msg.attachments)}
                                        </div>
                                        <span className="message-time">{formatTime(msg.timestamp)}</span>

                                        {/* Reaction Button */}
                                        <div className="message-actions" style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            [isOwnMessage ? 'left' : 'right']: '-32px',
                                            opacity: activePickerId === msg._id ? 1 : 0,
                                            transition: 'all 0.2s ease',
                                            zIndex: 20, // Higher z-index to stay above other bubbles
                                            padding: '4px'
                                        }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActivePickerId(activePickerId === msg._id ? null : msg._id);
                                                }}
                                                className="reaction-trigger-btn"
                                                style={{
                                                    background: 'var(--primary-light)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '28px',
                                                    height: '28px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    color: 'white',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    transition: 'transform 0.2s ease'
                                                }}
                                            >
                                                <Smile size={16} />
                                            </button>

                                            <AnimatePresence>
                                                {activePickerId === msg._id && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        [isOwnMessage ? 'left' : 'right']: '0',
                                                        bottom: '100%',
                                                        marginBottom: '8px',
                                                        zIndex: 100
                                                    }}>
                                                        <ReactionPicker
                                                            onSelect={(emoji) => {
                                                                onReact(msg._id, emoji);
                                                                setActivePickerId(null);
                                                            }}
                                                            onClose={() => setActivePickerId(null)}
                                                        />
                                                    </div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Reactions Display */}
                                    <ReactionDisplay
                                        reactions={msg.reactions}
                                        currentUserId={currentUserId}
                                        onReact={(emoji) => onReact(msg._id, emoji)}
                                    />
                                </div>

                                <style>{`
                                    .message-bubble-wrapper:hover .message-actions {
                                        opacity: 1 !important;
                                    }
                                    .reaction-trigger-btn:hover {
                                        background: rgba(255, 255, 255, 0.3) !important;
                                        color: white !important;
                                        transform: scale(1.1);
                                    }
                                `}</style>
                            </motion.div>
                        </React.Fragment>
                    );
                })}
            </AnimatePresence>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="typing-indicator"
                >
                    <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span className="typing-text">
                        {typingUsers.length === 1
                            ? `${getUserName(typingUsers[0])} is typing...`
                            : `${typingUsers.length} people are typing...`}
                    </span>
                </motion.div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
