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
});

// ✅ Automatically add Authorization header to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
