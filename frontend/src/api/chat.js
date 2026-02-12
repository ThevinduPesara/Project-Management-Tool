import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chat';

// Get message history for a group
export const fetchMessages = async (groupId, page = 1, limit = 50) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}/messages`, {
            params: { page, limit },
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

// Send a message (HTTP fallback)
export const sendMessage = async (groupId, content) => {
    try {
        const response = await axios.post(
            `${API_URL}/${groupId}/messages`,
            { content },
            {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

// Mark messages as read
export const markAsRead = async (groupId) => {
    try {
        const response = await axios.patch(
            `${API_URL}/${groupId}/read`,
            {},
            {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error marking messages as read:', error);
        throw error;
    }
};

// Get unread message count
export const getUnreadCount = async (groupId) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}/unread`, {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });
        return response.data.unreadCount;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};
