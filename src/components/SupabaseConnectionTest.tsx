import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { supabase } from '../lib/supabase';

const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [records, setRecords] = useState<any[]>([]);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Probando conexión a Supabase...');

    try {
      // Test 1: Verificar conexión básica
      const { data: testData, error: testError } = await supabase
        .from('blood_pressure_records')
        .select('count')
        .limit(1);

      if (testError) {
        throw new Error(`Error de conexión: ${testError.message}`);
      }

      // Test 2: Obtener registros existentes
      const { data: recordsData, error: recordsError } = await supabase
        .from('blood_pressure_records')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);

      if (recordsError) {
        throw new Error(`Error al obtener registros: ${recordsError.message}`);
      }

      setStatus('success');
      setMessage('✅ Conexión exitosa a Supabase');
      setRecords(recordsData || []);

    } catch (error) {
      setStatus('error');
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const addTestRecord = async () => {
    try {
      const testRecord = {
        id: Date.now().toString(),
        systolic: 120,
        diastolic: 80,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        timestamp: Date.now(),
      };

      const { error } = await supabase
        .from('blood_pressure_records')
        .insert([testRecord]);

      if (error) {
        throw new Error(`Error al insertar: ${error.message}`);
      }

      setMessage('✅ Registro de prueba agregado exitosamente');
      testConnection(); // Recargar registros

    } catch (error) {
      setMessage(`❌ Error al agregar registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🧪 Test de Conexión a Supabase
        </Typography>
        
        {status === 'idle' && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Presiona el botón para verificar la conexión con Supabase
            </Typography>
            <Button variant="contained" onClick={testConnection}>
              Probar Conexión
            </Button>
          </Box>
        )}

        {status === 'testing' && (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>{message}</Typography>
          </Box>
        )}

        {status === 'success' && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Registros encontrados: {records.length}
            </Typography>
            <Button variant="outlined" onClick={addTestRecord} sx={{ mr: 1 }}>
              Agregar Registro de Prueba
            </Button>
            <Button variant="contained" onClick={testConnection}>
              Actualizar
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              {message}
            </Alert>
            <Button variant="contained" onClick={testConnection}>
              Reintentar
            </Button>
          </Box>
        )}

        {records.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Últimos registros:
            </Typography>
            {records.map((record) => (
              <Typography key={record.id} variant="body2" component="div">
                • {record.systolic}/{record.diastolic} mmHg - {record.date} {record.time}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;
