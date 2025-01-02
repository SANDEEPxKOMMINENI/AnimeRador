import * as React from 'react';
import { Toaster as Sonner, toast as sonnerToast } from 'sonner';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-background',
        success: 'border-green-500/30 bg-green-500/10 text-green-600',
        destructive: 'destructive group border-destructive bg-destructive text-destructive-foreground',
        warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600',
        info: 'border-blue-500/30 bg-blue-500/10 text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, onClose, ...props }, ref) => {
    const Icon = variant && iconMap[variant as keyof typeof iconMap];

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          {Icon && <Icon className="h-5 w-5" />}
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </div>
        {action}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export function Toaster() {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  );
}

type ToastVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

interface UseToastOptions {
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastMessage {
  title?: string;
  description?: string;
}

export function useToast() {
  const toast = (message: ToastMessage, options?: UseToastOptions) => {
    const { variant = 'default', duration = 5000, action } = options || {};
    const Icon = variant && iconMap[variant as keyof typeof iconMap];

    return sonnerToast(
      <Toast
        variant={variant}
        title={message.title}
        description={message.description}
        action={
          action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className="ml-2 shrink-0 rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {action.label}
            </button>
          )
        }
      />,
      {
        duration,
      }
    );
  };

  return {
    toast,
    success: (message: ToastMessage, options?: Omit<UseToastOptions, 'variant'>) =>
      toast(message, { ...options, variant: 'success' }),
    error: (message: ToastMessage, options?: Omit<UseToastOptions, 'variant'>) =>
      toast(message, { ...options, variant: 'destructive' }),
    warning: (message: ToastMessage, options?: Omit<UseToastOptions, 'variant'>) =>
      toast(message, { ...options, variant: 'warning' }),
    info: (message: ToastMessage, options?: Omit<UseToastOptions, 'variant'>) =>
      toast(message, { ...options, variant: 'info' }),
    promise: async <T,>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      return sonnerToast.promise(promise, {
        loading: {
          title: loading,
        },
        success: {
          title: typeof success === 'function' ? success : () => success,
        },
        error: {
          title: typeof error === 'function' ? error : () => error,
        },
      });
    },
    dismiss: sonnerToast.dismiss,
    message: sonnerToast,
  };
}

export type { ToastProps };