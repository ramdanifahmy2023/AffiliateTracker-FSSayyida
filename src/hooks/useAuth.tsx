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
};

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (page: string, permission: 'create' | 'read' | 'update' | 'delete') => boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isLeader: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Access control matrix remains the same as before
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        await checkUser();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(profile as Profile);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);

      const email = `${username}@login.internal`;
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // If auth user not exists, sign up and then sign in
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (signUpError) return { success: false, error: handleSupabaseError(signUpError) };

        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (retryError) return { success: false, error: handleSupabaseError(retryError) };
      }

      // Ensure profile exists
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData.session?.user;
      if (!authUser) return { success: false, error: 'Gagal mendapatkan sesi autentikasi' };

      const { data: existing, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .single();

      if (profileError || !existing) {
        // Seed minimal profile data
        await supabase.from('profiles').insert({
          id: authUser.id,
          full_name: username,
          username,
          role: 'staff',
          position: 'staff_host_live'
        } as any);
      }

      await checkUser();
      toast.success(`Selamat datang, ${username}!`);
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Terjadi kesalahan saat login' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      toast.success('Berhasil logout');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Gagal logout');
    }
  };

  const hasPermission = (page: string, permission: 'create' | 'read' | 'update' | 'delete') => {
    if (!user) return false;
    const pagePermissions = ACCESS_CONTROL[page as keyof typeof ACCESS_CONTROL];
    if (!pagePermissions) return false;
    const userPermissions = pagePermissions[user.position];
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
