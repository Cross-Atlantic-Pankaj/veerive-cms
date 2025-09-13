// import axios from 'axios'

// export default axios.create ({
//     baseURL: 'https://veeriveoct5.onrender.com'
// })

// // export default axios.create ({
// //     baseURL: 'https://veeriveoct5.onrender.com'
// // })

// import axios from 'axios';

// const baseURL =
//   process.env.NODE_ENV === 'development'
//     ? 'http://localhost:3050' // Backend running locally
//     : 'https://veeriveoct5.onrender.com'; // Deployed backend

// export default axios.create({
//   baseURL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: true, // Ensure cookies and headers are sent
// });
import axios from 'axios';
const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3050' // Backend running locally
    : 'https://backend-cms-blue.vercel.app'; // Deployed backend

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies and headers are sent
  timeout: 10000, // 10 second timeout
});

// ✅ Automatically add Authorization header to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle JWT token errors in responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      console.log('🔒 Token invalid, clearing session storage');
      sessionStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle JWT malformed errors specifically
    if (error.response?.data?.error?.includes('jwt malformed') || 
        error.response?.data?.error?.includes('Invalid token')) {
      console.log('🔒 JWT malformed, clearing session storage');
      sessionStorage.removeItem('token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
