import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Pill from './Pill';
import { SHARED_BG, ARTIFACT_RED, ARTIFACT_RED_DARK, getBorderStyle, ARTIFACT_RED_TRANSPARENT_10 } from '../constants/colors';

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
          fontSize: '14px', // Consistent font size
          fontWeight: 600,  // Consistent font weight
          color: '#222',    // Consistent font color
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Login/Register Switch Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', margin: '24px 0 16px 0', width: '100%', padding: '0 24px' }}>
          <Pill
            fullWidth
            background={activeTab === 0 ? ARTIFACT_RED_TRANSPARENT_10 : SHARED_BG}
            color={ARTIFACT_RED}
            onClick={() => setActiveTab(0)}
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              border: activeTab === 0 ? `1px solid ${ARTIFACT_RED}` : 'none',
            }}
          >
            login
          </Pill>
          <Pill
            fullWidth
            background={activeTab === 1 ? ARTIFACT_RED_TRANSPARENT_10 : SHARED_BG}
            color={ARTIFACT_RED}
            onClick={() => setActiveTab(1)}
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '14px',
              border: activeTab === 1 ? `1px solid ${ARTIFACT_RED}` : 'none',
            }}
          >
            register
          </Pill>
        </div>
        
        <div style={{ padding: '24px' }}>
          {activeTab === 0 ? (
            // Login Form
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* Email Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>

                {/* Password Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Pill
                  fullWidth
                  background="#ffebee"
                  color="#c62828"
                  sx={{
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    marginBottom: '16px',
                    border: '1px solid #ffcdd2',
                    fontSize: '14px',
                    fontWeight: 500,
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
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    marginBottom: '16px',
                    border: '1px solid #c8e6c9',
                    fontSize: '14px',
                    fontWeight: 500,
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
                  py: 0.5,
                  px: 2,
                  marginBottom: '16px',
                  border: 'none',
                  textAlign: 'center',
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
            </div>
          ) : (
            // Register Form
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {/* First Name Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>

                {/* Last Name Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>

                {/* Email Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>

                {/* Password Input */}
                <div>
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
                        fontWeight: 'inherit',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        textAlign: 'center',
                      }}
                    />
                  </Pill>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Pill
                  fullWidth
                  background="#ffebee"
                  color="#c62828"
                  sx={{
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    marginBottom: '16px',
                    border: '1px solid #ffcdd2',
                    fontSize: '14px',
                    fontWeight: 500,
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
                    borderRadius: '8px',
                    py: 1.5,
                    px: 2,
                    marginBottom: '16px',
                    border: '1px solid #c8e6c9',
                    fontSize: '14px',
                    fontWeight: 500,
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
                  py: 0.5,
                  px: 2,
                  marginBottom: '16px',
                  border: 'none',
                  textAlign: 'center',
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
            </div>
          )}
          
          {/* Cancel Button */}
          <Pill
            fullWidth
            background={ARTIFACT_RED}
            color="white"
            onClick={handleClose}
            sx={{
              py: 0.5,
              px: 2,
              border: 'none',
              textAlign: 'center',
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