import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useSocket } from '../../hooks/useSocket';
import { GlobalCopilot } from '../incident/GlobalCopilot';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Initialize socket connection globally within layout
  useSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f6f7fb] text-[#07111f]" style={{ fontFamily: '"Inter", sans-serif' }}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="pointer-events-none fixed inset-y-0 right-0 hidden w-[420px] bg-[radial-gradient(circle_at_100%_8%,rgba(255,79,10,0.055),transparent_34%)] xl:block" />
          <div className="relative mx-auto max-w-[1480px] space-y-5">
            {children}
          </div>
        </main>
      </div>
      {/* Global floating AI Copilot — visible on every authenticated page */}
      <GlobalCopilot />
    </div>
  );
};

export default Layout;
