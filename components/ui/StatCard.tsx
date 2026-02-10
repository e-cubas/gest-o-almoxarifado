
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { Card } from './Card';

interface StatCardProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  value: string | number;
  description?: string;
  iconColorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, iconColorClass = 'text-blue-500' }) => {
  return (
    <Card className="flex items-center !p-4">
      <div className={`p-3 rounded-full mr-4 bg-slate-100 dark:bg-slate-700 ${iconColorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 break-words leading-tight">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">{value}</p>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
    </Card>
  );
};
