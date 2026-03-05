import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface BloodPressureRecord {
  id: string;
  systolic: number;
  diastolic: number;
  heart_rate: number | null;
  date: string;
  time: string;
  timestamp: number;
  user_id?: string;
}

interface BloodPressureState {
  records: BloodPressureRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<BloodPressureRecord, 'id' | 'timestamp' | 'user_id'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<Omit<BloodPressureRecord, 'id' | 'timestamp' | 'user_id'>>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  searchRecords: (filters: { startDate?: string; endDate?: string }) => BloodPressureRecord[];
  getRecordsByDateRange: (startDate: string, endDate: string) => BloodPressureRecord[];
}

export const useBloodPressureStore = create<BloodPressureState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  
  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) {
        set({ records: [], loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('blood_pressure_records')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      set({ 
        records: data || [], 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching records',
        loading: false 
      });
    }
  },
  
  addRecord: async (record) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const newRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: Date.now(),
        user_id: userId,
      };

      const { error } = await supabase
        .from('blood_pressure_records')
        .insert([newRecord]);

      if (error) throw error;
      
      // Refetch records to get the latest data
      await get().fetchRecords();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error adding record',
        loading: false 
      });
    }
  },

  updateRecord: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('blood_pressure_records')
        .update(updatedData)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Refetch records to get the latest data from Supabase
      await get().fetchRecords();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error updating record',
        loading: false 
      });
    }
  },
  
  deleteRecord: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('blood_pressure_records')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
      set((state) => ({
        records: state.records.filter((record) => record.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error deleting record',
        loading: false 
      });
    }
  },
  
  getRecordsByDateRange: (startDate, endDate) => {
    const { records } = get();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return records.filter((record) => {
      const recordDate = new Date(record.date).getTime();
      return recordDate >= start && recordDate <= end;
    });
  },

  searchRecords: (filters) => {
    const { records } = get();
    let filteredRecords = [...records];
    
    // Ordenar por fecha y hora (más reciente primero)
    filteredRecords.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dateTimeB - dateTimeA;
    });
    
    // Filtrar por rango de fechas si se proporciona
    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime();
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.date).getTime() >= startTime
      );
    }
    
    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime();
      filteredRecords = filteredRecords.filter(record => 
        new Date(record.date).getTime() <= endTime
      );
    }
    
    return filteredRecords;
  },
}));
