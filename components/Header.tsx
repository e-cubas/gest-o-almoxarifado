
import React from 'react';
import { Menu, LogOut } from 'lucide-react';
import type { MainViewType } from '../types';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  mainView: MainViewType;
  toggleSidebar: () => void;
}

const viewTitles: Record<MainViewType, string> = {
  dashboard: 'Dashboard Geral',
  stock: 'Controle de Estoque e Cadastros',
  movement: 'Movimentação de Materiais e Ferramentas',
  reports: 'Relatórios de Consumo',
};

export const Header: React.FC<HeaderProps> = ({ mainView, toggleSidebar }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <div className="flex items-center overflow-hidden">
        <button onClick={toggleSidebar} className="lg:hidden mr-4 text-slate-500 dark:text-slate-400">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
          {viewTitles[mainView]}
        </h2>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        title="Sair"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
};
