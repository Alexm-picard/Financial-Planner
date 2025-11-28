import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Divider,
  useTheme,
} from '@mui/material';
import { AccountBalance, Google } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSignInWithGoogle, useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [signInWithGoogle, , googleLoading, googleError] = useSignInWithGoogle(auth);
  const [createUserWithEmailAndPassword, , emailLoading, emailError] = useCreateUserWithEmailAndPassword(auth);

  useEffect(() => {
    if (googleError) {
      setErrorMessage(googleError.message);
    }
    if (emailError) {
      setErrorMessage(emailError.message);
    }
  }, [googleError, emailError]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(email, password);

      if (userCredential?.user) {
        await setDoc(doc(db, 'user', userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          createdAt: new Date().toISOString(),
        });

        navigate('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleRegister = async () => {
    setErrorMessage('');

    try {
      const result = await signInWithGoogle();

      if (result?.user) {
        // Check if user document already exists (in case user signs in again)
        const userDocRef = doc(db, 'user', result.user.uid);
        await setDoc(userDocRef, {
          uid: result.user.uid,
          name: result.user.displayName || name,
          email: result.user.email,
          createdAt: new Date().toISOString(),
        }, { merge: true }); // merge: true prevents overwriting if document exists

        navigate('/');
      }
    } catch (error: any) {
      console.error('Google registration error:', error);
      setErrorMessage(error.message || 'Google registration failed. Please try again.');
    }
  };

  const loading = emailLoading || googleLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A78BFA 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
            boxShadow: '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
            p: 5,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                color: 'white',
                mb: 3,
                boxShadow: '0px 10px 15px -3px rgba(99, 102, 241, 0.4), 0px 4px 6px -2px rgba(99, 102, 241, 0.2)',
              }}
            >
              <AccountBalance sx={{ fontSize: 56 }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Create Account
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#64748B', fontSize: '1.125rem' }}>
              Start managing your finances today
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleEmailRegister} sx={{ mb: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mb: 2.5, 
                py: 1.75,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                minHeight: 52,
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleGoogleRegister}
            disabled={loading}
            startIcon={<Google />}
            sx={{ 
              mb: 3.5, 
              py: 1.75,
              borderRadius: 3,
              borderWidth: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderColor: '#E2E8F0',
              color: '#334155',
              minHeight: 52,
              '&:hover': {
                borderWidth: 1.5,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
              },
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                href="/login"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
