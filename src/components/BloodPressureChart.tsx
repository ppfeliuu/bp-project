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
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      isMobile
        ? new Date(`${record.date}T${record.time}`).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
          })
        : new Date(`${record.date}T${record.time}`).toLocaleDateString('es-ES', {
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
        tension: 0.25,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 4 : 5,
      },
      {
        label: 'Tensión Baja (Diastólica)',
        data: filteredRecords.map(record => record.diastolic),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.25,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 4 : 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        labels: {
          boxWidth: isMobile ? 10 : 24,
          boxHeight: isMobile ? 10 : 12,
          usePointStyle: true,
          pointStyle: 'line',
          font: {
            size: isMobile ? 11 : 12,
          },
          padding: isMobile ? 10 : 16,
        },
      },
      title: {
        display: !isMobile,
        text: 'Evolución de la Presión Arterial',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 180,
        title: {
          display: !isMobile,
          text: 'Presión (mmHg)',
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
        },
      },
      x: {
        title: {
          display: !isMobile,
          text: 'Fecha y Hora',
        },
        ticks: {
          maxTicksLimit: isMobile ? 4 : 8,
          font: {
            size: isMobile ? 10 : 12,
          },
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Gráfica de Evolución
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredRecords.length} registros • {getDateRangeInfo()}
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 120, width: { xs: '100%', sm: 'auto' } }}>
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
            height: { xs: 280, sm: 400 },
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
