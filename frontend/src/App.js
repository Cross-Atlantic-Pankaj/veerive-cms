import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import Register from './pages/Register';
import UserLogin from './pages/UserLogin';
import HomeFeed from './pages/HomeFeed';
import Home from './pages/Home';
import Header from './components/Home/Header';
import ContextDetail from './pages/ContextDetail';  // Import ContextDetail component
import ThemeHome from './pages/ThemeHome';
import ThemeDetail from './pages/ThemeDetail';
import SectorHome from './pages/SectorHome';

import PrivateRoute from './components/PrivateRoute'; // Ensure you are using this for protecting routes if needed
import { HomeFeedProvider } from './context/HomeFeedContext';

function App() {
  const { state } = useContext(AuthContext);

  return (
    <div>
      {/* Conditionally render Header based on login state */}
      {state.isLoggedIn && <Header />}
      <HomeFeedProvider>
      <Routes>
        {/* Redirect to home if already logged in */}
        <Route path="/" element={state.isLoggedIn ? <Navigate to="/home" /> : <UserLogin />} />
        
        {/* Protect home route */}
        <Route path="/home" element={state.isLoggedIn ? <Home /> : <Navigate to="/" />} />
        
        {/* Other routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/home-feed" element={<HomeFeed />} />
        <Route path="/theme-home" element={<ThemeHome />} />
        <Route path="/theme/:id" element={<ThemeDetail />} />
        <Route path="/sector-home" element={<SectorHome />} />

        {/* Add a route for ContextDetail */}
        <Route path="/context/:id" element={<ContextDetail />} />

        {/* Add more routes as needed */}

      </Routes>
      </HomeFeedProvider>
      <ToastContainer />
    </div>
  );
}

export default App;
