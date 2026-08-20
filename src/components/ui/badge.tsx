import * as React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}