import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

const estimateDifficulty = async (taskData, token) => {
    const response = await axios.post(`${API_URL}/estimate-difficulty`, taskData, {
        headers: { 'x-auth-token': token }
    });
    return response.data;
};

export default {
    estimateDifficulty
};
