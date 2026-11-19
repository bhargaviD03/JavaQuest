import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 rounded-2xl p-6 shadow-sm dark:shadow-none backdrop-blur-sm transition-all duration-200 ${
        hoverable ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-950/50 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
