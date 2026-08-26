import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationDrawer from './NotificationDrawer';

export default function Layout({ children }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenNotifications={() => setNotificationsOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
}
