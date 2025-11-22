import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Clock, History as HistoryIcon, Settings as SettingsIcon, LogIn, UserPlus } from 'lucide-react';
import { ThemeProvider } from './components/ThemeContext/ThemeContext';
import { SettingsProvider } from './components/SettingsContext/SettingsContext';
import { AuthProvider } from './components/AuthContext/AuthContext.jsx';
import Preloader from './components/Preloader/Preloader';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';
import './theme.css';

// Lazy load components
const TimeClock = React.lazy(() => import('./components/TimeClock/TimeClock'));
const History = React.lazy(() => import('./components/History/History'));
const Settings = React.lazy(() => import('./components/Settings/Settings'));
const Login = React.lazy(() => import('./components/Login/Login'));
const Registration = React.lazy(() => import('./components/Registration/Registration'));

const navItems = [
  { path: '/', icon: Clock, label: 'Time Clock' },
  { path: '/history', icon: HistoryIcon, label: 'History' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' }
];

const authNavItems = [
  { path: '/login', icon: LogIn, label: 'Login' },
  { path: '/register', icon: UserPlus, label: 'Register' }
];

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Simulate some async initialization (e.g., checking auth, loading config)
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // If app is loading, show preloader
  if (isLoading) {
    return <Preloader />;
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Suspense fallback={<Preloader />}>
                <Routes>
                  {/* Authentication Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Registration />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Navbar navItems={navItems} />
                        <TimeClock />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/history" 
                    element={
                      <ProtectedRoute>
                        <Navbar navItems={navItems} />
                        <History />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Navbar navItems={navItems} />
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>

              <footer className="footer">
                <div className="footer-content">
                  <div className="footer-left">
                    <div className="footer-brand">
                      <h3 className="footer-logo">exTime</h3>
                      <p className="footer-tagline">Precision time management for professionals</p>
                    </div>
                    <p className="footer-copyright">© {new Date().getFullYear()} exTime. All rights reserved.</p>
                  </div>
                  <div className="footer-right">
                    <div className="footer-section">
                      <h4>Product</h4>
                      <a href="#features">Features</a>
                      <a href="#pricing">Pricing</a>
                      <a href="#updates">Updates</a>
                    </div>
                    <div className="footer-section">
                      <h4>Support</h4>
                      <a href="#help">Help Center</a>
                      <a href="#contact">Contact</a>
                      <a href="#docs">Documentation</a>
                    </div>
                    <div className="footer-section">
                      <h4>Legal</h4>
                      <a href="#privacy">Privacy Policy</a>
                      <a href="#terms">Terms of Service</a>
                      <a href="#security">Security</a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;