import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Pill from './Pill';
import { ARTIFACT_RED, ARTIFACT_RED_DARK, ARTIFACT_RED_TRANSPARENT_10, SHARED_BG } from '../constants/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../constants/typography';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { login, register } = useAuth();

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const success = await login(email, password);
    if (success) {
      setSuccess('Login successful!');
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    
    const success = await register(email, password, firstName, lastName);
    if (success) {
      setSuccess('Registration successful! Please login.');
      setActiveTab(0);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } else {
      setError('Registration failed. Email might already be in use.');
    }
    setLoading(false);
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: SHARED_BG,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '400px',
          maxWidth: '90vw',
          overflow: 'hidden',
          fontSize: FONT_SIZES.MEDIUM, // Consistent font size
          fontWeight: FONT_WEIGHTS.BOLD,  // Consistent font weight
          color: '#222',    // Consistent font color
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Website Title */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '8px',
            fontSize: FONT_SIZES.XLARGE,
            fontWeight: FONT_WEIGHTS.BOLD,
            color: ARTIFACT_RED,
          }}>
            theartifact
          </div>

          {/* Login/Register Switch Buttons */}
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <Pill
              sx={{
                width: '50%',
                textAlign: 'center',
                fontWeight: FONT_WEIGHTS.BOLD,
                fontSize: FONT_SIZES.MEDIUM,
                border: activeTab === 0 ? `1px solid ${ARTIFACT_RED}` : 'none',
              }}
              background={activeTab === 0 ? ARTIFACT_RED_TRANSPARENT_10 : SHARED_BG}
              color={ARTIFACT_RED}
              onClick={() => setActiveTab(0)}
            >
              login
            </Pill>
            <Pill
              sx={{
                width: '50%',
                textAlign: 'center',
                fontWeight: FONT_WEIGHTS.BOLD,
                fontSize: FONT_SIZES.MEDIUM,
                border: activeTab === 1 ? `1px solid ${ARTIFACT_RED}` : 'none',
              }}
              background={activeTab === 1 ? ARTIFACT_RED_TRANSPARENT_10 : SHARED_BG}
              color={ARTIFACT_RED}
              onClick={() => setActiveTab(1)}
            >
              register
            </Pill>
          </div>

          {activeTab === 0 ? (
            // Login Form
            <>
              {/* Email Input */}
              <Pill fullWidth>
                <input
                  type="email"
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Password Input */}
              <Pill fullWidth>
                <input
                  type="password"
                  placeholder="enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Error/Success Messages */}
              {error && (
                <Pill
                  fullWidth
                  background="#ffebee"
                  color="#c62828"
                  sx={{
                    border: '1px solid #ffcdd2',
                    fontWeight: FONT_WEIGHTS.BOLD,
                  }}
                >
                  {error}
                </Pill>
              )}
              
              {success && (
                <Pill
                  fullWidth
                  background="#e8f5e8"
                  color="#2e7d32"
                  sx={{
                    border: '1px solid #c8e6c9',
                    fontWeight: FONT_WEIGHTS.BOLD,
                  }}
                >
                  {success}
                </Pill>
              )}

              {/* Login Button */}
              <Pill
                fullWidth
                background={ARTIFACT_RED}
                color="white"
                onClick={handleLogin}
                sx={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  '&:hover': {
                    background: ARTIFACT_RED_DARK,
                  },
                  transition: 'all 0.2s ease',
                  }}
                >
                {loading ? 'logging in...' : 'login'}
              </Pill>
            </>
          ) : (
            // Register Form
            <>
              {/* First Name Input */}
              <Pill fullWidth>
                <input
                  type="text"
                  placeholder="enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Last Name Input */}
              <Pill fullWidth>
                <input
                  type="text"
                  placeholder="enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Email Input */}
              <Pill fullWidth>
                <input
                  type="email"
                  placeholder="enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Password Input */}
              <Pill fullWidth>
                <input
                  type="password"
                  placeholder="enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'inherit',
                    fontWeight: FONT_WEIGHTS.BOLD,
                    fontSize: FONT_SIZES.MEDIUM,
                    lineHeight: 'inherit',
                    textAlign: 'center',
                  }}
                />
              </Pill>

              {/* Error/Success Messages */}
              {error && (
                <Pill
                  fullWidth
                  background="#ffebee"
                  color="#c62828"
                  sx={{
                    border: '1px solid #ffcdd2',
                    fontWeight: FONT_WEIGHTS.BOLD,
                  }}
                >
                  {error}
                </Pill>
              )}
              
              {success && (
                <Pill
                  fullWidth
                  background="#e8f5e8"
                  color="#2e7d32"
                  sx={{
                    border: '1px solid #c8e6c9',
                    fontWeight: FONT_WEIGHTS.BOLD,
                  }}
                >
                  {success}
                </Pill>
              )}

              {/* Register Button */}
              <Pill
                fullWidth
                background={ARTIFACT_RED}
                color="white"
                onClick={handleRegister}
                sx={{
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  '&:hover': {
                    background: ARTIFACT_RED_DARK,
                  },
                  transition: 'all 0.2s ease',
                  }}
                >
                {loading ? 'creating account...' : 'create account'}
              </Pill>
            </>
          )}
          
          {/* Cancel Button */}
          <Pill
            fullWidth
            background={ARTIFACT_RED}
            color="white"
            onClick={handleClose}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                background: ARTIFACT_RED_DARK,
              },
              transition: 'all 0.2s ease',
            }}
          >
            cancel
          </Pill>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 