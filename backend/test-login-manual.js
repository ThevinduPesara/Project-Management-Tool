const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'thevindupesara@gmail.com',
            password: 'password123' // I'll try a common password or check if there's a test user
        });
        console.log('Login Response:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
