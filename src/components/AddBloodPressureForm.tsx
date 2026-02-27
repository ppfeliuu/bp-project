import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useBloodPressureStore } from '../store/bloodPressureStore';

const AddBloodPressureForm: React.FC = () => {
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  
  const addRecord = useBloodPressureStore((state) => state.addRecord);
  const loading = useBloodPressureStore((state) => state.loading);
  const error = useBloodPressureStore((state) => state.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!systolic || !diastolic || !date || !time) {
      return;
    }

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);

    if (isNaN(systolicNum) || isNaN(diastolicNum)) {
      return;
    }

    await addRecord({
      systolic: systolicNum,
      diastolic: diastolicNum,
      date,
      time,
    });

    if (!error) {
      setSystolic('');
      setDiastolic('');
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Añadir Registro de Presión Arterial
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Tensión Alta (Sistólica)"
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  inputProps={{ min: 60, max: 250 }}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Tensión Baja (Diastólica)"
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  inputProps={{ min: 40, max: 150 }}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Hora"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  disabled={loading}
                />
              </Box>
            </Box>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              fullWidth
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Añadir Registro'}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddBloodPressureForm;
