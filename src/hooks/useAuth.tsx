import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { toast } from 'sonner';

// Profiles-based auth
export type UserPosition = 'superadmin' | 'leader' | 'admin' | 'staff_host_live' | 'staff_content_creator' | 'viewer';

type Profile = {
  id: string;
  full_name: string;
  birth_date: string | null;
  position: UserPosition;
  username: string;
  address: string | null;
  start_date: string;
  group_id: string | null;
  created_at: string;
  updated_at: string;
  avatar_url?: string; // Menambahkan avatar_url dari skema
};

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>; // Diubah dari username ke email
  signOut: () => Promise<void>;
  hasPermission: (page: string, permission: 'create' | 'read' | 'update' | 'delete') => boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isLeader: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Access control matrix
const ACCESS_CONTROL = {
  dashboard: {
    superadmin: ['read'],
    leader: ['read'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  performa_tim: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  laporan_harian: {
    superadmin: [],
    leader: [],
    admin: [],
    staff_host_live: ['create', 'read', 'update'],
    staff_content_creator: ['create', 'read', 'update'],
    viewer: []
  },
  absensi: {
    superadmin: [],
    leader: [],
    admin: [],
    staff_host_live: ['create', 'read'],
    staff_content_creator: ['create', 'read'],
    viewer: []
  },
  data_komisi: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  cashflow: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read'],
    admin: ['create', 'read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  assets: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['read'],
    admin: ['create', 'read', 'update', 'delete'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  debt_receivables: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read'],
    admin: ['create', 'read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  sop_documents: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['read'],
    admin: ['read'],
    staff_host_live: ['read'],
    staff_content_creator: ['read'],
    viewer: ['read']
  },
  laba_rugi: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['read'],
    admin: ['create', 'read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  direktori_karyawan: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update'],
    admin: [],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  inventaris_device: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  daftar_akun: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  manage_group: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  kpi_targets: {
    superadmin: ['create', 'read', 'update', 'delete'],
    leader: ['create', 'read', 'update', 'delete'],
    admin: ['read'],
    staff_host_live: [],
    staff_content_creator: [],
    viewer: ['read']
  },
  pengaturan: {
    superadmin: ['read', 'update'],
    leader: ['read', 'update'],
    admin: ['read', 'update'],
    staff_host_live: ['read', 'update'],
    staff_content_creator: ['read', 'update'],
    viewer: ['read', 'update']
  }
} as const;

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        await checkUser();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      console.log('Checking user...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        console.log('Session found, fetching profile for user:', session.user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          // Jika error mengambil profile, sign out untuk konsistensi
          await supabase.auth.signOut();
          setUser(null);
        } else if (profile) {
          console.log('Profile found:', profile);
          setUser(profile as Profile);
        } else {
          console.log('No profile found');
          setUser(null);
        }
      } else {
        console.log('No session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with email:', email);

      // HAPUS KONVERSI USERNAME
      // const email = `${username}@login.internal`;
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email,
        password
      });

      if (authError) {
        console.error('Auth error:', authError);
        return { 
          success: false, 
          error: authError.message === 'Invalid login credentials' 
            ? 'Email atau password salah' // Pesan diubah
            : handleSupabaseError(authError) || 'Login gagal'
        };
      }

      if (data.user) {
        console.log('Auth successful, user ID:', data.user.id);
        
        // Tunggu sebentar untuk memastikan session tersimpan
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fetch profile langsung setelah login berhasil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error after login:', profileError);
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'Gagal mengambil data profil. Silakan coba lagi.' 
          };
        }

        if (profile) {
          console.log('Profile set after login:', profile);
          setUser(profile as Profile);
          toast.success(`Selamat datang, ${profile.full_name}!`);
          return { success: true };
        } else {
          await supabase.auth.signOut();
          return { 
            success: false, 
            error: 'Profil pengguna tidak ditemukan.' 
          };
        }
      } else {
        return { success: false, error: 'Login gagal' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Terjadi kesalahan umum saat login' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Berhasil logout');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Gagal logout');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (page: string, permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    const pagePermissions = ACCESS_CONTROL[page as keyof typeof ACCESS_CONTROL];
    if (!pagePermissions) return false;
    const userPermissions = pagePermissions[user.position];
    if (!Array.isArray(userPermissions)) return false;
    return userPermissions.includes(permission);
  };

  const isStaff = user?.position === 'staff_host_live' || user?.position === 'staff_content_creator';
  const isAdmin = user?.position === 'admin';
  const isLeader = user?.position === 'leader';
  const isSuperAdmin = user?.position === 'superadmin';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, hasPermission, isStaff, isAdmin, isLeader, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
