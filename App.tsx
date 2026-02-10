
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { useWarehouseData } from './hooks/useWarehouseData';
import type { MainViewType } from './types';
import { StockView } from './components/hubs/StockView';
import { MovementView } from './components/hubs/MovementView';
import { ReportsView } from './components/hubs/ReportsView';
import { DashboardView } from './components/hubs/DashboardView';
import { Auth } from './components/auth/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [mainView, setMainView] = useState<MainViewType>('dashboard');
  const data = useWarehouseData();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (mainView) {
      case 'dashboard':
        return <DashboardView data={data} />;
      case 'stock':
        return <StockView data={data} />;
      case 'movement':
        return <MovementView data={data} />;
      case 'reports':
        return <ReportsView data={data} />;
      default:
        return <DashboardView data={data} />;
    }
  };

  return (
    <Layout mainView={mainView} setMainView={setMainView}>
      {renderContent()}
    </Layout>
  );
}

export default App;