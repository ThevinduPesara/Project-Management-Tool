import axios from 'axios';

const API_URL = 'http://localhost:5000/api/calendar';

const syncDeadlines = async (token) => {
    const response = await axios.post(`${API_URL}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export default {
    syncDeadlines
};
