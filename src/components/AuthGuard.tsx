import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CenteredMessage from './CenteredMessage';

interface AuthGuardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  title = "Login Required", 
  description = "You must be logged in to view this page. Redirecting to login...",
  requireAuth = true 
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  // Handle authentication check
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      setShowAuthMessage(true);
      const timer = setTimeout(() => {
        navigate('/', { state: { openLogin: true } });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate, requireAuth]);

  if (!requireAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated && showAuthMessage) {
    return (
      <CenteredMessage
        title={title}
        description={description}
        showSpinner
      />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard; 