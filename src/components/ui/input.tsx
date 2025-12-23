import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-slate-200/60 bg-white/80 backdrop-blur-sm px-3 py-1 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-slate-400 focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-slate-400/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100/50',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';


