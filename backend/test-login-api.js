import axios from 'axios';

const testLogin = async () => {
    try {
        console.log('🧪 Testing login API...');
        
        const loginData = {
            email: 'info@veerive.com',
            password: 'admin123'
        };
        
        console.log('Sending login request:', loginData);
        
        const response = await axios.post('http://localhost:3050/api/users/login', loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Login successful!');
        console.log('Response:', response.data);
        
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
