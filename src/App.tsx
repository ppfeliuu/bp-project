import React, { useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Typography,
  Box,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { theme } from './theme/theme';
import AddBloodPressureForm from './components/AddBloodPressureForm';
import BloodPressureList from './components/BloodPressureList';
import BloodPressureChart from './components/BloodPressureChart';
import { AuthLoginCard } from './components/AuthLoginCard';
import { useAuthStore } from './store/authStore';

const App: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100vw',
        overflowX: 'hidden',
      }}>
        <Box sx={{
          width: '100%',
          maxWidth: '900px',
          px: 2,
          py: 4,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Control de Presión Arterial
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Monitoriza y registra tus mediciones de presión arterial
          </Typography>

          {!initialized ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : user ? (
            <Stack spacing={4}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={() => void signOut()}
                  disabled={loading}
                >
                  Cerrar sesión
                </Button>
              </Box>
              <AddBloodPressureForm />
              <BloodPressureChart />
              <BloodPressureList />
            </Stack>
          ) : (
            <Stack spacing={3}>
              {error && <Alert severity="error">{error}</Alert>}
              <AuthLoginCard />
            </Stack>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
