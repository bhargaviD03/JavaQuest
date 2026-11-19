import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate' | 'easy' | 'medium' | 'hard' | 'Easy' | 'Medium' | 'Hard' | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'slate', size = 'sm', className = '' }) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-semibold',
  };

  const variantStyles: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
    blue: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
    easy: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold',
    medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold',
    hard: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
  };

  const chosenVariant = variantStyles[variant.toLowerCase()] || variantStyles.slate;

  return (
    <span className={`inline-flex items-center gap-1 uppercase tracking-wider ${sizeStyles[size]} ${chosenVariant} ${className}`}>
      {children}
    </span>
  );
};
