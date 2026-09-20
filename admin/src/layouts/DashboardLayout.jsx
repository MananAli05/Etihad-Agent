import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-charcoal font-sans antialiased flex flex-col">
      {/* Sidebar (Fixed on Desktop, Drawer on Mobile) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Container */}
      <div className="lg:pl-[260px] flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
