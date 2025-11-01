import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[300px] hidden md:block">
          <Sidebar className="h-full" />
        </div>

        {/* Main Content */}
        <div className="flex-1 h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
