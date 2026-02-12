import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageList = ({ messages, currentUserId, typingUsers = [] }) => {
    const messagesEndRef = useRef(null);

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
                                style={{ marginTop: isGrouped ? '0.25rem' : '1rem' }}
                            >
                                {!isOwnMessage && !isGrouped && (
                                    <div className="message-sender">
                                        <div className="sender-avatar">
                                            {msg.sender.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="sender-name">{msg.sender.name}</span>
                                    </div>
                                )}

                                <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                                    <p className="message-content">{msg.content}</p>
                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                </div>
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
                        {typingUsers[0]} is typing...
                    </span>
                </motion.div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
