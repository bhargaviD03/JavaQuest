import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'box' | 'text' | 'circle' | 'pill';
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'box',
  width,
  height,
  borderRadius,
  className = '',
  style = {},
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'pill':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4';
      case 'box':
      default:
        return 'rounded-xl';
    }
  };

  const combinedStyle: React.CSSProperties = {
    ...(width !== undefined && { width }),
    ...(height !== undefined && { height }),
    ...(borderRadius !== undefined && { borderRadius }),
    ...style,
  };

  return (
    <div
      className={`bg-slate-200/80 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/20 animate-shimmer ${getVariantClasses()} ${className}`.trim()}
      style={combinedStyle}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  gap?: string;
}> = ({ lines = 3, className = '', gap = 'gap-2' }) => {
  return (
    <div className={`flex flex-col ${gap} w-full`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="text"
          className={`h-3.5 ${
            idx === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          } ${className}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-shimmer space-y-3 ${className}`}
    >
      {children || (
        <>
          <div className="flex items-center justify-between">
            <Skeleton variant="pill" width={70} height={20} />
            <Skeleton variant="circle" width={28} height={28} />
          </div>
          <Skeleton variant="box" height={22} width="85%" />
          <SkeletonText lines={2} />
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <Skeleton variant="text" width={90} height={14} />
            <Skeleton variant="text" width={50} height={14} />
          </div>
        </>
      )}
    </div>
  );
};

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="grid gap-4 items-center p-3.5 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, cIdx) => (
            <Skeleton
              key={cIdx}
              variant="text"
              height={16}
              className={cIdx === 0 ? 'w-4/5' : 'w-3/5'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
