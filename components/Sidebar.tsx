
import React from 'react';
import {
  LayoutDashboard, X, Wrench, Package, Home,
  FileText, Users, PackagePlus, PackageMinus, BarChart3, Repeat
} from 'lucide-react';
import type { MainViewType } from '../types';

interface SidebarProps {
  mainView: MainViewType;
  setMainView: (view: MainViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
    }`}
  >
    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ mainView, setMainView, isOpen, setIsOpen }) => {
  const handleSetView = (newView: MainViewType) => {
    setMainView(newView);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed lg:relative z-40 flex-shrink-0 w-64 bg-slate-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <h1 className="text-xl font-bold text-white">Almoxarifado</h1>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          <NavItem
            icon={Home}
            label="Dashboard"
            isActive={mainView === 'dashboard'}
            onClick={() => handleSetView('dashboard')}
          />
          <NavItem
            icon={LayoutDashboard}
            label="Controle de Estoque"
            isActive={mainView === 'stock'}
            onClick={() => handleSetView('stock')}
          />
          <NavItem 
            icon={Repeat} 
            label="Movimentação" 
            isActive={mainView === 'movement'} 
            onClick={() => handleSetView('movement')} 
          />
          <NavItem 
            icon={BarChart3} 
            label="Relatórios" 
            isActive={mainView === 'reports'} 
            onClick={() => handleSetView('reports')} 
          />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">© 2024 Warehouse System</p>
        </div>
      </aside>
    </>
  );
};
