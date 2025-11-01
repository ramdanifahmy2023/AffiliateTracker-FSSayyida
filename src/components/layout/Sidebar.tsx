import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import {
  BarChart3,
  Users,
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  CreditCard,
  BookOpen,
  Target,
  Smartphone,
  UserCheck,
  Settings,
  Building2,
  LogOut,
  PieChart
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { generateAvatar, getUserPositionColor } from '../../lib/supabase';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  page: string;
  permission: 'create' | 'read' | 'update' | 'delete';
  description?: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    href: '/dashboard',
    page: 'dashboard',
    permission: 'read',
    description: 'Data & Insight'
  },
  {
    title: 'Performa Tim',
    icon: Users,
    href: '/performa-tim',
    page: 'performa_tim',
    permission: 'read',
    description: 'Performa Tim & Individu'
  },
  {
    title: 'Laporan Harian',
    icon: FileText,
    href: '/laporan-harian',
    page: 'laporan_harian',
    permission: 'create',
    description: 'Jurnal Laporan Harian'
  },
  {
    title: 'Absensi',
    icon: Clock,
    href: '/absensi',
    page: 'absensi',
    permission: 'create',
    description: 'Absensi Karyawan'
  },
  {
    title: 'Data Komisi',
    icon: DollarSign,
    href: '/data-komisi',
    page: 'data_komisi',
    permission: 'read',
    description: 'Data Komisi Affiliate'
  },
  {
    title: 'Cashflow',
    icon: TrendingUp,
    href: '/cashflow',
    page: 'cashflow',
    permission: 'read',
    description: 'Arus Kas & Pembukuan'
  },
  {
    title: 'Management Asset',
    icon: Package,
    href: '/assets',
    page: 'assets',
    permission: 'read',
    description: 'Management Asset'
  },
  {
    title: 'Hutang Piutang',
    icon: CreditCard,
    href: '/debt-receivables',
    page: 'debt_receivables',
    permission: 'read',
    description: 'Saldo Hutang Piutang'
  },
  {
    title: 'SOP & Knowledge',
    icon: BookOpen,
    href: '/sop',
    page: 'sop_documents',
    permission: 'read',
    description: 'SOP & Knowledge Center'
  },
  {
    title: 'Laba Rugi',
    icon: PieChart,
    href: '/laba-rugi',
    page: 'laba_rugi',
    permission: 'read',
    description: 'Laba Rugi Bisnis'
  },
  {
    title: 'Direktori Karyawan',
    icon: UserCheck,
    href: '/karyawan',
    page: 'direktori_karyawan',
    permission: 'read',
    description: 'Direktori Karyawan'
  },
  {
    title: 'Inventaris Device',
    icon: Smartphone,
    href: '/devices',
    page: 'inventaris_device',
    permission: 'read',
    description: 'Inventaris Device Tim'
  },
  {
    title: 'Daftar Akun Affiliate',
    icon: Users,
    href: '/akun-affiliate',
    page: 'daftar_akun',
    permission: 'read',
    description: 'Daftar Akun Affiliate'
  },
  {
    title: 'Manage Group',
    icon: Building2,
    href: '/groups',
    page: 'manage_group',
    permission: 'read',
    description: 'Manage Group'
  },
  {
    title: 'Goal & Target KPI',
    icon: Target,
    href: '/kpi-targets',
    page: 'kpi_targets',
    permission: 'read',
    description: 'Goal & Target KPI'
  }
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user, hasPermission, signOut } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const visibleMenuItems = menuItems.filter(item => 
    hasPermission(item.page, item.permission)
  );

  const handleSignOut = async () => {
    if (window.confirm('Yakin ingin keluar?')) {
      await signOut();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            FAHMYID
          </h1>
          <p className="text-sm text-gray-500 truncate">
            Affiliate Manager
          </p>
        </div>
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={user.avatar_url || generateAvatar(user.full_name)} 
            alt={user.full_name} 
          />
          <AvatarFallback>
            {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.full_name}
          </p>
          <Badge 
            variant="secondary" 
            className={cn("text-xs", getUserPositionColor(user.position))}
          >
            {user.position.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          to="/pengaturan"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            location.pathname === '/pengaturan'
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Settings className={cn(
            "w-5 h-5",
            location.pathname === '/pengaturan' ? "text-blue-600" : "text-gray-500"
          )} />
          <span>Pengaturan</span>
        </Link>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 px-3 py-2 h-auto font-medium text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </Button>
      </div>
    </div>
  );
}