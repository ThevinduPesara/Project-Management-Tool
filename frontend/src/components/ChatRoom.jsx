import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { fetchMessages, markAsRead } from '../api/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { motion } from 'framer-motion';
import { MessageSquare, WifiOff } from 'lucide-react';

const ChatRoom = ({ groupId, currentUserId }) => {
    const { socket, connected } = useSocket();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState([]);
    const [error, setError] = useState(null);

    // Fetch initial message history
    useEffect(() => {
        const loadMessages = async () => {
            try {
                setLoading(true);
                const data = await fetchMessages(groupId);
                setMessages(data.messages || []);

                // Mark messages as read when entering chat
                await markAsRead(groupId);
            } catch (err) {
                console.error('Error loading messages:', err);
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, [groupId]);

    // Socket event handlers
    useEffect(() => {
        if (!socket || !connected) return;

        // Join the group room
        socket.emit('join-group', groupId);

        // Listen for new messages
        const handleNewMessage = (message) => {
            setMessages(prev => [...prev, message]);

            // Mark as read if the chat is open
            if (message.sender._id !== currentUserId) {
                markAsRead(groupId);
            }
        };

        // Listen for typing indicators
        const handleUserTyping = ({ userId, isTyping }) => {
            if (userId === currentUserId) return;

            setTypingUsers(prev => {
                if (isTyping) {
                    return [...prev, userId];
                } else {
                    return prev.filter(id => id !== userId);
                }
            });

            // Clear typing indicator after 3 seconds
            if (isTyping) {
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(id => id !== userId));
                }, 3000);
            }
        };

        socket.on('new-message', handleNewMessage);
        socket.on('user-typing', handleUserTyping);

        // Cleanup
        return () => {
            socket.emit('leave-group', groupId);
            socket.off('new-message', handleNewMessage);
            socket.off('user-typing', handleUserTyping);
        };
    }, [socket, connected, groupId, currentUserId]);

    // Send message handler
    const handleSendMessage = useCallback((content) => {
        if (!socket || !connected) {
            setError('Not connected to chat server');
            return;
        }

        socket.emit('send-message', {
            groupId,
            content
        });
    }, [socket, connected, groupId]);

    // Handle typing indicator
    const handleTyping = useCallback((isTyping) => {
        if (!socket || !connected) return;

        socket.emit('typing', {
            groupId,
            isTyping
        });
    }, [socket, connected, groupId]);

    if (loading) {
        return (
            <div className="chat-container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '400px',
                    color: 'var(--text-dim)'
                }}>
                    Loading messages...
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="chat-container glass-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '600px',
                padding: 0,
                overflow: 'hidden'
            }}
        >
            {/* Chat Header */}
            <div className="chat-header" style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MessageSquare size={20} color="var(--primary-light)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Group Chat</h3>
                </div>

                {!connected && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-dim)',
                        fontSize: '0.85rem'
                    }}>
                        <WifiOff size={16} />
                        <span>Disconnected</span>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem'
            }}>
                {messages.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--text-dim)',
                        gap: '1rem'
                    }}>
                        <MessageSquare size={48} opacity={0.3} />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    <MessageList
                        messages={messages}
                        currentUserId={currentUserId}
                        typingUsers={typingUsers}
                    />
                )}
            </div>

            {/* Message Input */}
            <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                {error && (
                    <div style={{
                        color: '#ff6b6b',
                        fontSize: '0.85rem',
                        marginBottom: '0.5rem'
                    }}>
                        {error}
                    </div>
                )}
                <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={!connected}
                />
            </div>
        </motion.div>
    );
};

export default ChatRoom;
