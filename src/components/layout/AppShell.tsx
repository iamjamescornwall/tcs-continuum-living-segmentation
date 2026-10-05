import React, { useState } from 'react';
import TopBar from './TopBar';
import SideNav from './SideNav';
import AskContinuumDrawer from './AskContinuumDrawer';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-canvas flex flex-col antialiased">
      {/* 56px TopBar */}
      <TopBar />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible SideNav */}
        <SideNav
          collapsed={navCollapsed}
          onToggleCollapse={() => setNavCollapsed((prev) => !prev)}
        />

        {/* Primary Page Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto p-4 sm:p-6 space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Ask Continuum AI Assistant */}
      <AskContinuumDrawer />
    </div>
  );
};

export default AppShell;
