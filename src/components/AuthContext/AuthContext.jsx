import React, { createContext, useState, useContext, useEffect } from 'react';

// Create AuthContext
const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        
        // Update state
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);

        return { success: true, user: data.user };
      } else {
        // Handle login error
        console.error('Login failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check token validity on mount
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      console.log('Validating token:', token);

      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Validation response status:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('Validated user:', userData);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token is invalid
            console.log('Token validation failed');
            logout();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        // No token
        console.log('No token found');
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // Context value
  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};