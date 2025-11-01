import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/dashboard/Dashboard';
import LaporanHarian from './pages/laporan/LaporanHarian';
import Absensi from './pages/attendance/Absensi';
import DataKomisi from './pages/commission/DataKomisi';
import Cashflow from './pages/finance/Cashflow';
import KpiTargets from './pages/kpi/KpiTargets';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true,
        element: (
          <ProtectedRoute requiredPage="dashboard" requiredPermission="read">
            <Dashboard /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute requiredPage="dashboard" requiredPermission="read">
            <Dashboard /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'laporan-harian', 
        element: (
          <ProtectedRoute requiredPage="laporan_harian" requiredPermission="create">
            <LaporanHarian /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'absensi', 
        element: (
          <ProtectedRoute requiredPage="absensi" requiredPermission="create">
            <Absensi /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'data-komisi', 
        element: (
          <ProtectedRoute requiredPage="data_komisi" requiredPermission="read">
            <DataKomisi /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'cashflow', 
        element: (
          <ProtectedRoute requiredPage="cashflow" requiredPermission="read">
            <Cashflow /> 
          </ProtectedRoute>
        )
      },
      { 
        path: 'kpi-targets', 
        element: (
          <ProtectedRoute requiredPage="kpi_targets" requiredPermission="read">
            <KpiTargets /> 
          </ProtectedRoute>
        )
      },
    ]
  }
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AuthProvider>
  );
}