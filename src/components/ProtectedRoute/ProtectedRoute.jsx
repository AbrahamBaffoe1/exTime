import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';
import Preloader from '../Preloader/Preloader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, isLoading } = useAuth();

  // If still loading, show preloader
  if (isLoading) {
    return <Preloader />;
  }

  // If not authenticated and not loading, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;