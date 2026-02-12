import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Paperclip, X, File, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const MessageInput = ({ onSendMessage, onTyping, disabled, members = [] }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [attachments, setAttachments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Get mention handle from name (no spaces, lowercase)
    const getHandle = (name) => name.replace(/\s+/g, '').toLowerCase();

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const trimmedMessage = message.trim();
        if ((trimmedMessage || attachments.length > 0) && !disabled && !isUploading) {
            onSendMessage(trimmedMessage, attachments);
            setMessage('');
            setAttachments([]);
            setIsTyping(false);
            setShowMentions(false);
            if (onTyping) onTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (showMentions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredMembers.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                insertMention(filteredMembers[selectedIndex]);
            } else if (e.key === 'Escape') {
                setShowMentions(false);
            }
            return;
        }

        // Send on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const insertMention = (member) => {
        const cursorPosition = textareaRef.current.selectionStart;
        const textBeforeCaret = message.substring(0, cursorPosition);
        const textAfterCaret = message.substring(cursorPosition);

        const lastAtIndices = textBeforeCaret.lastIndexOf('@');
        const handle = getHandle(member.name);

        const newMessage = textBeforeCaret.substring(0, lastAtIndices) + `@${handle} ` + textAfterCaret;
        setMessage(newMessage);
        setShowMentions(false);

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current.focus();
            const newPos = lastAtIndices + handle.length + 2;
            textareaRef.current.setSelectionRange(newPos, newPos);
        }, 0);
    };

    const handleChange = (e) => {
        const val = e.target.value;
        setMessage(val);

        const cursorPosition = e.target.selectionStart;
        const textBeforeCaret = val.substring(0, cursorPosition);
        const lastAtIndices = textBeforeCaret.lastIndexOf('@');
        const lastSpaceIndices = textBeforeCaret.lastIndexOf(' ');

        if (lastAtIndices !== -1 && lastAtIndices > lastSpaceIndices) {
            const query = textBeforeCaret.substring(lastAtIndices + 1);
            setMentionQuery(query);

            const filtered = members.filter(m =>
                getHandle(m.name).includes(query.toLowerCase()) ||
                m.name.toLowerCase().includes(query.toLowerCase())
            );

            if (filtered.length > 0) {
                setFilteredMembers(filtered);
                setShowMentions(true);
                setSelectedIndex(0);
            } else {
                setShowMentions(false);
            }
        } else {
            setShowMentions(false);
        }

        // Handle typing indicator
        if (onTyping) {
            if (!isTyping && val.length > 0) {
                setIsTyping(true);
                onTyping(true);
            }

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                onTyping(false);
            }, 3000);

            if (val.length === 0) {
                setIsTyping(false);
                onTyping(false);
            }
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setAttachments(prev => [...prev, res.data]);
        } catch (err) {
            console.error('File upload failed:', err);
            alert('Failed to upload file. Size might be too large or invalid type.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="message-input-wrapper" style={{ position: 'relative' }}>
            {/* Mention Suggestions */}
            <AnimatePresence>
                {showMentions && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mentions-dropdown glass-card"
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            width: '250px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginBottom: '0.5rem',
                            zIndex: 1000,
                            padding: '0.5rem',
                            background: 'rgba(30, 30, 45, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px'
                        }}
                    >
                        {filteredMembers.map((member, index) => (
                            <div
                                key={member._id}
                                onClick={() => insertMention(member)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.6rem 0.75rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: index === selectedIndex ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                                    transition: 'background 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    {member.name.charAt(0)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'white' }}>{member.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>@{getHandle(member.name)}</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Attachments Preview */}
            <AnimatePresence>
                {attachments.length > 0 && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        marginBottom: '0.5rem'
                    }}>
                        {attachments.map((file, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                {file.mimeType.startsWith('image/') ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.url}`}
                                        alt="attachment"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <File size={24} color="var(--text-dim)" />
                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                                            {file.originalName}
                                        </span>
                                    </div>
                                )}
                                <button
                                    onClick={() => removeAttachment(index)}
                                    style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '2px',
                                        background: 'rgba(0,0,0,0.5)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="message-input-container">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <button
                    type="button"
                    className="icon-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    style={{
                        padding: '0.6rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        cursor: (disabled || isUploading) ? 'not-allowed' : 'pointer',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                </button>

                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Connecting to chat..." : "Type a message..."}
                    className="message-input"
                    rows={1}
                    disabled={disabled}
                    style={{
                        resize: 'none',
                        overflowY: 'auto',
                        maxHeight: '120px'
                    }}
                />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={(!message.trim() && attachments.length === 0) || disabled || isUploading}
                    style={{
                        padding: '0.6rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: ((!message.trim() && attachments.length === 0) || disabled || isUploading) ? 0.5 : 1
                    }}
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
