import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'icon' | 'sm';
}

const baseClasses =
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/30 hover:shadow-xl hover:shadow-slate-900/40 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
  outline:
    'border border-slate-200/80 bg-white/80 backdrop-blur-sm text-slate-900 shadow-sm hover:shadow-md hover:bg-white/90 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all duration-200 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-slate-50/50 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200',
  ghost:
    'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition-all duration-200 backdrop-blur-sm',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  icon: 'h-8 w-8',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant] ?? variantClasses.default,
          sizeClasses[size] ?? sizeClasses.default,
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';


