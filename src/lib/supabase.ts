import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function to format date
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('id-ID', { ...defaultOptions, ...options }).format(
    typeof date === 'string' ? new Date(date) : date
  );
};

// Helper function to mask phone number
export const maskPhoneNumber = (phone: string): string => {
  if (phone.length < 8) return phone;
  const start = phone.substring(0, 4);
  const end = phone.substring(phone.length - 3);
  return `${start}***${end}`;
};

// Helper function to generate avatar
export const generateAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const colors = ['3B82F6', '10B981', 'F59E0B', 'EF4444', '8B5CF6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=128`;
};

// Helper function to calculate percentage change
export const calculatePercentageChange = (
  current: number,
  previous: number
): {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'gray';
  isGood: boolean;
} => {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      trend: current > 0 ? 'up' : 'stable',
      color: current > 0 ? 'green' : 'gray',
      isGood: current > 0
    };
  }

  const change = ((current - previous) / previous) * 100;
  const percentage = Math.abs(change);
  const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';

  return {
    percentage: Number(percentage.toFixed(2)),
    trend,
    color: trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray',
    isGood: trend === 'up'
  };
};

// Helper function to get user position color
export const getUserPositionColor = (position: string): string => {
  const colors: Record<string, string> = {
    superadmin: 'bg-red-100 text-red-800',
    leader: 'bg-blue-100 text-blue-800',
    admin: 'bg-green-100 text-green-800',
    staff_host_live: 'bg-purple-100 text-purple-800',
    staff_content_creator: 'bg-pink-100 text-pink-800',
    viewer: 'bg-gray-100 text-gray-800'
  };
  return colors[position] || 'bg-gray-100 text-gray-800';
};

// Helper function to get account status color
export const getAccountStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    temp_banned: 'bg-yellow-100 text-yellow-800',
    perm_banned: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get data status color
export const getDataStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    empty: 'bg-gray-100 text-gray-800',
    pending: 'bg-orange-100 text-orange-800',
    rejected: 'bg-red-100 text-red-800',
    verified: 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to get payment status color
export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Helper function to validate shift sequence
export const validateShiftSequence = async (
  userId: string,
  reportDate: string,
  shift: string
): Promise<{ valid: boolean; message?: string }> => {
  const { data: existingReports } = await supabase
    .from('daily_reports')
    .select('shift')
    .eq('user_id', userId)
    .eq('report_date', reportDate)
    .order('shift');

  if (!existingReports) {
    return { valid: true };
  }

  const existingShifts = existingReports.map(r => parseInt(r.shift));
  const targetShift = parseInt(shift);

  // Check if shift already exists
  if (existingShifts.includes(targetShift)) {
    return {
      valid: false,
      message: `Shift ${shift} sudah diisi untuk tanggal ini`
    };
  }

  // Check if shifts are sequential
  if (targetShift === 2 && !existingShifts.includes(1)) {
    return {
      valid: false,
      message: 'Shift 1 harus diisi terlebih dahulu'
    };
  }

  if (targetShift === 3 && !existingShifts.includes(2)) {
    return {
      valid: false,
      message: 'Shift 2 harus diisi terlebih dahulu'
    };
  }

  return { valid: true };
};

// Helper function to get opening balance based on shift
export const getOpeningBalance = async (
  userId: string,
  deviceId: string,
  reportDate: string,
  shift: string,
  liveStatus: string
): Promise<number> => {
  // If status is 'mati' or 'relive', return 0
  if (liveStatus === 'mati' || liveStatus === 'relive') {
    return 0;
  }

  // If shift 1, return 0
  if (shift === '1') {
    return 0;
  }

  // Get closing balance from previous shift
  const previousShift = shift === '2' ? '1' : '2';

  const { data: previousReport } = await supabase
    .from('daily_reports')
    .select('closing_balance')
    .eq('user_id', userId)
    .eq('device_id', deviceId)
    .eq('report_date', reportDate)
    .eq('shift', previousShift)
    .single();

  if (!previousReport) {
    throw new Error(`Shift ${previousShift} belum diisi. Harap isi shift secara berurutan.`);
  }

  return previousReport.closing_balance;
};

// Error handler for Supabase errors
export const handleSupabaseError = (error: any): string => {
  if (error?.message) {
    // Handle specific error cases
    if (error.message.includes('duplicate key')) {
      return 'Data sudah ada. Silakan cek kembali.';
    }
    if (error.message.includes('foreign key')) {
      return 'Data terkait tidak ditemukan.';
    }
    if (error.message.includes('not-null')) {
      return 'Semua field wajib diisi.';
    }
    if (error.message.includes('check constraint')) {
      return 'Data tidak valid. Silakan periksa kembali.';
    }
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak terduga.';
};