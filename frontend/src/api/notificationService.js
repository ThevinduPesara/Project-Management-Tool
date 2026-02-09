import axios from 'axios';

const API_URL = 'http://localhost:5000/api/notifications';

const getNotifications = async (token) => {
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const markAsRead = async (id, token) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default {
    getNotifications,
    markAsRead
};
