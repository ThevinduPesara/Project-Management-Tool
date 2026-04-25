async function testLogin() {
    const email = 'gajadeeraconstruction@gmail.com';
    const password = 'any';

    try {
        console.log(`Testing login for ${email}...`);
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log(`Login response status ${response.status}:`, data);
    } catch (err) {
       
    }
}

testLogin();
