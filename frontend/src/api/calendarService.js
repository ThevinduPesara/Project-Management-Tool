import api from './axios';

const syncDeadlines = async () => {
    const response = await api.post('/calendar/sync');
    return response.data;
};

const getAuthUrl = async () => {
    const response = await api.get('/calendar/auth-url');
    return response.data;
};

export default {
    syncDeadlines,
    getAuthUrl
};
