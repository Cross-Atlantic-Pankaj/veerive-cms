import { Routes, Route } from 'react-router-dom';
import { useContext, useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import PostContext from './context/PostContext';
import AuthContext from './context/AuthContext';
import { RegionProvider } from './components/RegionProvider';
import { CountryProvider } from './components/CountryProvider';
import { SectorProvider } from './components/SectorProvider';
import { SubSectorProvider } from './components/SubSectorProvider';
import { SignalProvider } from './components/SignalProvider';
import { SubSignalProvider } from './components/SubSignalProvider';
import { CompanyProvider } from './components/CompanyProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { SourceProvider } from './components/SourceProvider';
import { ContextProvider } from './components/ContextProvider';
import { PostProvider } from './components/PostProvider';
import Login from './pages/Login';
import HeaderComponent from './pages/HeaderComponent';
import RegionPage from './pages/Region/RegionPage';
import CountryPage from './pages/Country/CountryPage';
import SectorPage from './pages/Sector/SectorPage';
import SubSectorPage from './pages/SubSector/SubSectorPage';
import SignalPage from './pages/Signal/SignalPage';
import SubSignalPage from './pages/SubSignal/SubSignalPage';
import CompanyPage from './pages/Company/CompanyPage';
import SourcePage from './pages/Source/SourcePage';
import ThemePage from './pages/Theme/ThemePage';
import ContextPage from './pages/Context/ContextPage';
import PostPage from './pages/Post/PostPage';
import ContainerPage from './pages/Container/ContainerPage';
import PrivateRoute from './components/PrivateRoute'
import StoryOrder from './pages/StoryOrder/StoryOrder';
import StoryView from './pages/StoryOrder/StoryView';
import UserListPage from './pages/UserListPage';
import AdminHomePage from './pages/AdminHomePage';
import SettingsPage from './pages/SettingsPage';
import ForgotPassword from './pages/ForgotPassowrd';
import ResetPassword from './pages/ReasetPassword';

function App() {
  const { state, loading  } = useContext(AuthContext);
  const postContext = useContext(PostContext); // ✅ Get PostContext safely
  const fetchPosts = postContext?.fetchPosts || (() => {}); // ✅ Prevent error if undefined

  useEffect(() => {
    if (state.isLoggedIn && fetchPosts) {
      fetchPosts(); // ✅ Fetch all posts only when logged in
    }
  }, [state.isLoggedIn, fetchPosts]);

  // If loading is true, show a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <RegionProvider>
      <CountryProvider>
        <SectorProvider>
          <SubSectorProvider>
            <SignalProvider>
              <SubSignalProvider>
                <CompanyProvider>
                  <SourceProvider>
                    <ThemeProvider>
                        <ContextProvider>
                          <PostProvider>
                          <div>
                            {state.isLoggedIn && <HeaderComponent />}
                            
                            <Routes>
                              <Route path="/" element={<Login />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password" element={<ResetPassword />} />
                                <Route
                                    path="/admin-home"
                                    element={
                                        <PrivateRoute>
                                            <AdminHomePage />
                                        </PrivateRoute>
                                    }
                                />

                              <Route path="/user-details" element={
                                <PrivateRoute>
                                  <UserListPage />
                                </PrivateRoute>
                              } />

                              <Route path="/themes" element={
                                <PrivateRoute>
                                <ThemePage />
                                </PrivateRoute>
                                } />
                              <Route path="/companies" element={
                                <PrivateRoute>
                                <CompanyPage />
                                </PrivateRoute>
                                } />
                              <Route path="/sources" element={
                                <PrivateRoute>
                                <SourcePage />
                                </PrivateRoute>
                                } />
                              <Route path="/signals" element={
                                <PrivateRoute>
                                <SignalPage />
                                </PrivateRoute>
                                } />
                              <Route path="/sub-signals" element={
                                <PrivateRoute>
                                <SubSignalPage />
                                </PrivateRoute>
                                } />
                              <Route path="/sectors" element={
                                <PrivateRoute>
                                <SectorPage />
                                </PrivateRoute>
                                } />
                              <Route path="/sub-sectors" element={
                                <PrivateRoute>
                                <SubSectorPage />
                                </PrivateRoute>
                                } />
                              <Route path="/regions" element={
                                <PrivateRoute>
                                <RegionPage />
                                </PrivateRoute>
                                } />
                              <Route path="/countries" element={
                                <PrivateRoute>
                                <CountryPage />
                                </PrivateRoute>
                                } />
                              <Route path="/contexts" element={
                                <PrivateRoute>
                                <ContextPage />
                                </PrivateRoute>
                                } />
                              <Route path="/posts" element={
                                <PrivateRoute>
                                <PostPage />
                                </PrivateRoute>
                                } />
                            <Route path="/container-module" element={
                                <PrivateRoute>
                                <ContainerPage />
                                </PrivateRoute>
                                } />

                            <Route path="/story-order" element={
                                <PrivateRoute>
                                <StoryOrder />
                                </PrivateRoute>
                                } />
                              
                              <Route path="/story-view" element={
                                <PrivateRoute>
                                <StoryView />
                                </PrivateRoute>
                                } />

                                <Route path="/settings" element={
                                <PrivateRoute>
                                <SettingsPage />
                                </PrivateRoute>
                                } />
                            </Routes>

                            <ToastContainer />
                          </div>
                        </PostProvider>
                      </ContextProvider>
                    </ThemeProvider>
                  </SourceProvider>
                </CompanyProvider>
              </SubSignalProvider>
            </SignalProvider>
          </SubSectorProvider>
        </SectorProvider>
      </CountryProvider>
    </RegionProvider>
  );
}
export default App;
