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

const router = createBrowserRouter([
  {
    path: '/',
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
        path: '/dashboard', 
        element: (
          <ProtectedRoute requiredPage="dashboard" requiredPermission="read">
            <Dashboard /> 
          </ProtectedRoute>
        )
      },
      { 
        path: '/laporan-harian', 
        element: (
          <ProtectedRoute requiredPage="laporan_harian" requiredPermission="create">
            <LaporanHarian /> 
          </ProtectedRoute>
        )
      },
      { 
        path: '/absensi', 
        element: (
          <ProtectedRoute requiredPage="absensi" requiredPermission="create">
            <Absensi /> 
          </ProtectedRoute>
        )
      },
      { 
        path: '/data-komisi', 
        element: (
          <ProtectedRoute requiredPage="data_komisi" requiredPermission="read">
            <DataKomisi /> 
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
