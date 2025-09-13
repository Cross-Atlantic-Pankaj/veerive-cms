import axios from 'axios';

const testLogin = async () => {
    try {
        
        const loginData = {
            email: 'info@veerive.com',
            password: 'admin123'
        };
        
        
        const response = await axios.post('http://localhost:3050/api/users/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        
    } catch (error) {
        console.error('❌ Login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testLogin();
