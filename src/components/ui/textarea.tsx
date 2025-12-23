import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-slate-200/60 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-slate-400 focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-slate-400/20 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-100/50',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';


