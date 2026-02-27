import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAuthStore } from '../store/authStore';

export const AuthLoginCard: React.FC = () => {
  type AuthMode = 'login' | 'register' | 'recover';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSuccessMessage(null);
    clearError();
    if (nextMode === 'recover') {
      setPassword('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    clearError();

    if (mode === 'login') {
      await signIn(email, password);
      return;
    }

    if (mode === 'register') {
      await signUp(email, password);
      if (!useAuthStore.getState().error) {
        setSuccessMessage('Cuenta creada. Revisa tu email para confirmar el acceso.');
      }
      return;
    }

    await resetPassword(email);
    if (!useAuthStore.getState().error) {
      setSuccessMessage('Te enviamos un correo para recuperar tu contraseña.');
    }
  };

  const title = mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Crear cuenta' : 'Recuperar contraseña';
  const description =
    mode === 'login'
      ? 'Accede con tu usuario de Supabase para gestionar tus registros.'
      : mode === 'register'
      ? 'Crea un usuario nuevo para guardar tus registros de forma segura.'
      : 'Introduce tu email y te enviaremos un enlace para restablecer la contraseña.';

  const submitLabel = mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace';
  const submitLoadingLabel =
    mode === 'login' ? 'Entrando...' : mode === 'register' ? 'Creando cuenta...' : 'Enviando...';

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <CardContent>
        <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>

          {/* <Stack direction="row" spacing={1}>
            <Button
              type="button"
              onClick={() => handleModeChange('login')}
              variant={mode === 'login' ? 'contained' : 'outlined'}
              size="small"
            >
              Login
            </Button>
            <Button
              type="button"
              onClick={() => handleModeChange('register')}
              variant={mode === 'register' ? 'contained' : 'outlined'}
              size="small"
            >
              Registro
            </Button>
            <Button
              type="button"
              onClick={() => handleModeChange('recover')}
              variant={mode === 'recover' ? 'contained' : 'outlined'}
              size="small"
            >
              Recuperar
            </Button>
          </Stack> */}

          <Divider />

          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            fullWidth
            disabled={loading}
          />

          {mode !== 'recover' && (
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              fullWidth
              disabled={loading}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : mode === 'login' ? (
                <LoginIcon />
              ) : mode === 'register' ? (
                <PersonAddAlt1Icon />
              ) : (
                <MarkEmailReadIcon />
              )
            }
            disabled={loading}
            fullWidth
          >
            {loading ? submitLoadingLabel : submitLabel}
          </Button>
        </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
