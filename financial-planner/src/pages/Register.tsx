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
import { collection, addDoc } from 'firebase/firestore';

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
        await addDoc(collection(db, 'user'), {
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
        await addDoc(collection(db, 'user'), {
          uid: result.user.uid,
          name: result.user.displayName || name,
          email: result.user.email,
          createdAt: new Date().toISOString(),
        });

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
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
            p: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.light + '20',
                color: theme.palette.primary.main,
                mb: 2,
              }}
            >
              <AccountBalance sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
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
              sx={{ mb: 2, py: 1.5 }}
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
            sx={{ mb: 3, py: 1.5 }}
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
