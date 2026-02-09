async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful:', data);
        } else {
            console.error('Login failed with status:', response.status);
            console.error('Error data:', data);
        }
    } catch (error) {
        console.error('Login error:', error.message);
    }
}

testLogin();
