
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { MainViewType } from '../types';

interface LayoutProps {
  mainView: MainViewType;
  setMainView: (view: MainViewType) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ mainView, setMainView, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Sidebar mainView={mainView} setMainView={setMainView} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col transition-all duration-300">
        <Header mainView={mainView} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
