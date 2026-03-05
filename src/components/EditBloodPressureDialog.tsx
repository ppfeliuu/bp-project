import React, { useReducer, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useBloodPressureStore, type BloodPressureRecord } from '../store/bloodPressureStore';

interface EditBloodPressureDialogProps {
  open: boolean;
  record: BloodPressureRecord | null;
  onClose: () => void;
}

type FormDataState = {
  systolic: string;
  diastolic: string;
  heartRate: string;
  date: string;
  time: string;
};

type FormDataAction = 
  | { type: 'INITIALIZE'; payload: BloodPressureRecord }
  | { type: 'UPDATE_FIELD'; field: keyof FormDataState; value: string };

const formDataReducer = (state: FormDataState, action: FormDataAction): FormDataState => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        systolic: action.payload.systolic.toString(),
        diastolic: action.payload.diastolic.toString(),
        heartRate: action.payload.heart_rate.toString(),
        date: action.payload.date,
        time: action.payload.time,
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
};

const EditBloodPressureDialog: React.FC<EditBloodPressureDialogProps> = ({
  open,
  record,
  onClose,
}) => {
  const initialState: FormDataState = {
    systolic: '',
    diastolic: '',
    heartRate: '',
    date: '',
    time: '',
  };

  const [formData, dispatch] = useReducer(formDataReducer, initialState);

  const updateRecord = useBloodPressureStore((state) => state.updateRecord);
  const loading = useBloodPressureStore((state) => state.loading);
  const error = useBloodPressureStore((state) => state.error);

  // Solo sincronizamos cuando el diálogo se abre con un registro diferente
  useEffect(() => {
    if (open && record) {
      dispatch({ type: 'INITIALIZE', payload: record });
    }
  }, [open, record]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!record || !formData.systolic || !formData.diastolic || !formData.heartRate || !formData.date || !formData.time) {
      return;
    }

    const systolicNum = parseInt(formData.systolic);
    const diastolicNum = parseInt(formData.diastolic);
    const heartRateNum = parseInt(formData.heartRate);

    if (isNaN(systolicNum) || isNaN(diastolicNum) || isNaN(heartRateNum)) {
      return;
    }

    await updateRecord(record.id, {
      systolic: systolicNum,
      diastolic: diastolicNum,
      heart_rate: heartRateNum,
      date: formData.date,
      time: formData.time,
    });

    if (!error) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof FormDataState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({ type: 'UPDATE_FIELD', field, value: e.target.value });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon />
          <Typography variant="h6">Editar Registro</Typography>
        </Box>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Stack spacing={3}>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Tensión Alta (Sistólica)"
                  type="number"
                  value={formData.systolic}
                  onChange={handleInputChange('systolic')}
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
                  value={formData.diastolic}
                  onChange={handleInputChange('diastolic')}
                  inputProps={{ min: 40, max: 150 }}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Frecuencia Cardíaca (lpm)"
                  type="number"
                  value={formData.heartRate}
                  onChange={handleInputChange('heartRate')}
                  inputProps={{ min: 30, max: 220 }}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange('date')}
                  required
                  disabled={loading}
                />
              </Box>
              <Box flex="1 1 calc(50% - 8px)" minWidth={200}>
                <TextField
                  fullWidth
                  label="Hora"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange('time')}
                  required
                  disabled={loading}
                />
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditBloodPressureDialog;
