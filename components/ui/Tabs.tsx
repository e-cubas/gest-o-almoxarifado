
import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: { id: T, label: string }[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
}

export function Tabs<T extends string>({ tabs, activeTab, onTabChange }: TabsProps<T>) {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
