import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage, disabled }) => {
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        // Send on Enter, new line on Shift+Enter
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e) => {
        setMessage(e.target.value);

        // Emit typing indicator
        if (!isTyping && e.target.value.length > 0) {
            setIsTyping(true);
        } else if (isTyping && e.target.value.length === 0) {
            setIsTyping(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="message-input-container">
            <textarea
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
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
                disabled={!message.trim() || disabled}
                style={{
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: (!message.trim() || disabled) ? 0.5 : 1
                }}
            >
                <Send size={18} />
            </button>
        </form>
    );
};

export default MessageInput;
