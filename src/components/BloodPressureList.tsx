import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  IconButton,
  Chip,
  Stack,
  Box,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Pagination,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  WarningAmber as WarningAmberIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useBloodPressureStore, type BloodPressureRecord } from '../store/bloodPressureStore';
import EditBloodPressureDialog from './EditBloodPressureDialog';

const BloodPressureList: React.FC = () => {
  const records = useBloodPressureStore((state) => state.records);
  const deleteRecord = useBloodPressureStore((state) => state.deleteRecord);
  const fetchRecords = useBloodPressureStore((state) => state.fetchRecords);
  const searchRecords = useBloodPressureStore((state) => state.searchRecords);
  const loading = useBloodPressureStore((state) => state.loading);
  const error = useBloodPressureStore((state) => state.error);
  
  const [editingRecord, setEditingRecord] = useState<BloodPressureRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleEditRecord = (record: BloodPressureRecord) => {
    setEditingRecord(record);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingRecord(null);
  };

  const handleAskDeleteRecord = (id: string) => {
    setRecordIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setRecordIdToDelete(null);
  };

  const handleConfirmDeleteRecord = async () => {
    if (!recordIdToDelete) return;
    await deleteRecord(recordIdToDelete);
    handleCloseDeleteDialog();
  };

  const handleFilterChange = (field: 'startDate' | 'endDate') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }));
    setCurrentPage(1); // Resetear a la primera página al filtrar
  };

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  // Aplicar filtros y obtener registros paginados
  const filteredRecords = searchRecords(filters);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const startItem = filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredRecords.length);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    void event;
    setCurrentPage(value);
  };

  const getPressureCategory = (systolic: number, diastolic: number): { label: string; color: string } => {
    if (systolic < 90 || diastolic < 60) {
      return { label: 'Hipotensión', color: 'info' };
    }
    if (systolic < 120 && diastolic < 80) {
      return { label: 'Normal', color: 'success' };
    }
    if (systolic < 130 && diastolic < 80) {
      return { label: 'Elevada', color: 'warning' };
    }
    if (systolic < 140 || diastolic < 90) {
      return { label: 'Hipertensión Grado 1', color: 'warning' };
    }
    if (systolic < 180 || diastolic < 120) {
      return { label: 'Hipertensión Grado 2', color: 'error' };
    }
    return { label: 'Crisis Hipertensiva', color: 'error' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Cargando registros...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar los registros: {error}
          </Alert>
          <Box display="flex" justifyContent="center">
            <Button variant="contained" onClick={() => fetchRecords()}>
              Reintentar
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historial de Registros
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay registros aún. Añade tu primera medición arriba.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
                <Typography variant="h6" sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}>
                  Historial de Registros
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {filteredRecords.length} registros
                </Typography>
              </Box>
              <Button
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? 'contained' : 'outlined'}
                size="small"
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
              >
                Filtros
              </Button>
            </Box>

            {showFilters && (
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Filtrar por fecha
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <TextField
                    label="Fecha inicial"
                    type="date"
                    value={filters.startDate}
                    onChange={handleFilterChange('startDate')}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: { xs: '100%', sm: 150 }, width: { xs: '100%', sm: 'auto' } }}
                  />
                  <TextField
                    label="Fecha final"
                    type="date"
                    value={filters.endDate}
                    onChange={handleFilterChange('endDate')}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    sx={{ minWidth: { xs: '100%', sm: 150 }, width: { xs: '100%', sm: 'auto' } }}
                  />
                  <Button onClick={handleClearFilters} variant="outlined" size="small" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    Limpiar
                  </Button>
                </Stack>
              </Paper>
            )}

            {paginatedRecords.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No hay registros que coincidan con los filtros.
              </Typography>
            ) : (
              <>
                <List>
                  {paginatedRecords.map((record: BloodPressureRecord) => {
                    const category = getPressureCategory(record.systolic, record.diastolic);
                    return (
                      <ListItem
                        key={record.id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 2,
                          p: { xs: 1.5, sm: 2 },
                          bgcolor: 'background.paper',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            transform: 'translateY(-2px)',
                          },
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'stretch', sm: 'center' },
                          gap: { xs: 2, sm: 0 },
                        }}
                      >
                        <Box 
                          flex={1}
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'stretch', md: 'center' },
                            justifyContent: 'space-between',
                            gap: { xs: 1.25, md: 2.5 },
                            pr: { md: 1.5 },
                          }}
                        >
                          <Stack 
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            flexWrap="wrap"
                          >
                            <Box>
                              <Typography 
                                variant="h5" 
                                sx={{ 
                                  fontWeight: 'bold',
                                  color: 'primary.main',
                                  fontSize: { xs: '1.9rem', sm: '1.5rem' },
                                  lineHeight: 1.1,
                                }}
                              >
                                {record.systolic}/{record.diastolic}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                mmHg
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <FavoriteIcon sx={{ fontSize: 14, color: 'error.main' }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {record.heart_rate ?? '-'} lpm
                                </Typography>
                              </Box>
                            </Box>
                            <Chip
                              label={category.label}
                              color={category.color as 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'}
                              size="small"
                              sx={{
                                fontWeight: 'medium',
                                fontSize: '0.75rem',
                              }}
                            />
                          </Stack>
                          <Stack 
                            direction="row"
                            spacing={1.5}
                            sx={{
                              flexWrap: 'nowrap',
                              alignItems: 'center',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <CalendarMonthIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(record.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <AccessTimeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                              <Typography variant="body2" color="text.secondary">
                                {record.time}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            width: { xs: '100%', sm: 'auto' },
                            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                            pt: { xs: 1, sm: 0 },
                            borderTop: { xs: 1, sm: 0 },
                            borderLeft: { xs: 0, sm: 1 },
                            borderColor: 'divider',
                            pl: { xs: 0, sm: 1.5 },
                            ml: { xs: 0, sm: 1 },
                          }}
                        >
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleEditRecord(record)}
                            sx={{
                              p: { xs: 1, sm: 2 },
                              '&:hover': {
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleAskDeleteRecord(record.id)}
                            color="error"
                            sx={{
                              p: { xs: 1, sm: 2 },
                              '&:hover': {
                                bgcolor: 'error.light',
                                color: 'error.contrastText',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </ListItem>
                    );
                  })}
                </List>

                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {startItem}-{endItem} de {filteredRecords.length} registros
                  </Typography>
                  <Pagination
                    count={Math.max(totalPages, 1)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    disabled={totalPages <= 1}
                    size="small"
                  />
                </Box>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
      
      <EditBloodPressureDialog
        key={editingRecord?.id || 'edit-dialog'}
        open={editDialogOpen}
        record={editingRecord}
        onClose={handleCloseEditDialog}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'error.light',
                color: 'error.contrastText',
              }}
            >
              <WarningAmberIcon fontSize="small" />
            </Box>
            <Typography variant="h6">Confirmar eliminación</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Esta acción no se puede deshacer. ¿Deseas eliminar este registro de presión arterial?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeleteRecord}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BloodPressureList;
