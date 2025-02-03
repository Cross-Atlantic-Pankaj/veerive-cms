// import axios from 'axios'

// export default axios.create ({
//     baseURL: 'https://veeriveoct5.onrender.com'
// })

// // export default axios.create ({
// //     baseURL: 'https://veeriveoct5.onrender.com'
// // })


import axios from 'axios';

const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3050' // Backend running locally
    : 'https://veeriveoct5.onrender.com'; // Deployed backend

export default axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies and headers are sent
});
