// import axios from 'axios'

// export default axios.create ({
//  //   baseURL: 'http://localhost:3030'
//       baseURL: 'https://veeriveoct5.onrender.com'
// })


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

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3050';

export default axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensure cookies and headers are sent
});
