import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useBloodPressureStore } from '../store/bloodPressureStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BloodPressureChart: React.FC = () => {
  const records = useBloodPressureStore((state) => state.records);
  const [timeRange, setTimeRange] = React.useState<string>('7');

  const getFilteredRecords = () => {
    const now = new Date();
    const daysAgo = new Date();
    daysAgo.setDate(now.getDate() - parseInt(timeRange));
    daysAgo.setHours(0, 0, 0, 0);
    
    return records
      .filter(record => new Date(record.date) >= daysAgo)
      .sort((a, b) => {
        // Ordenar por fecha + hora cronológicamente
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return dateTimeA - dateTimeB;
      })
      .slice(-50);
  };

  const filteredRecords = getFilteredRecords();

  // Mostrar información sobre el rango de fechas
  const getDateRangeInfo = () => {
    if (filteredRecords.length === 0) return '';
    
    const firstDate = new Date(filteredRecords[0].date);
    const lastDate = new Date(filteredRecords[filteredRecords.length - 1].date);
    
    const formatDate = (date: Date) => date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    return `${formatDate(firstDate)} - ${formatDate(lastDate)}`;
  };

  const chartData = {
    labels: filteredRecords.map(record =>
      new Date(`${record.date}T${record.time}`).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label: 'Tensión Alta (Sistólica)',
        data: filteredRecords.map(record => record.systolic),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Tensión Baja (Diastólica)',
        data: filteredRecords.map(record => record.diastolic),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 600,
      easing: 'easeInOutQuart' as const,
    },
    transitions: {
      active: {
        animation: {
          duration: 400,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución de la Presión Arterial',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 180,
        title: {
          display: true,
          text: 'Presión (mmHg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Fecha y Hora',
        },
      },
    },
  };

  if (filteredRecords.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Gráfica de Evolución
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay datos suficientes para mostrar la gráfica. Añade más registros.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                Gráfica de Evolución
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredRecords.length} registros • {getDateRangeInfo()}
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={timeRange}
                label="Período"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7">Últimos 7 días</MenuItem>
                <MenuItem value="30">Últimos 30 días</MenuItem>
                <MenuItem value="90">Últimos 90 días</MenuItem>
                <MenuItem value="365">Último año</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{
            height: 400,
            transition: 'opacity 0.4s ease',
          }}>
            <Line data={chartData} options={options} />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BloodPressureChart;
