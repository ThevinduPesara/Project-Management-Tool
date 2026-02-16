const axios = require('axios');

const taskId = 'YOUR_TASK_ID'; // I need to find a task ID
const token = 'YOUR_TOKEN'; // I need a token

const testUpload = async () => {
    try {
        const res = await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, {
            status: 'Under Review',
            submissionNote: 'Test note'
        }, {
            headers: { 'x-auth-token': token }
        });
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
};

testUpload();
