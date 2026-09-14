import type * as React from "react";

interface CardProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function Card({ children, className = "" }: CardProps): React.ReactElement {
  return (
    <div
      className={`rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

Card.Title = function CardTitle({ children, className = "" }: CardTitleProps): React.ReactElement {
  return <h3 className={`text-lg font-semibold text-zinc-900 dark:text-zinc-100 ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

Card.Description = function CardDescription({ children, className = "" }: CardDescriptionProps): React.ReactElement {
  return <p className={`text-sm text-zinc-500 dark:text-zinc-400 mt-1 ${className}`}>{children}</p>;
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: "default" | "outline" | "ghost";
  readonly size?: "sm" | "md" | "lg";
  readonly children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps): React.ReactElement {
  const variantClasses = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    outline: "border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900",
    ghost: "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly labelKey?: string;
  readonly error?: string;
}

export function Input({ label, labelKey, error, className = "", ...props }: InputProps): React.ReactElement {
  return (
    <div className="w-full">
      {(label || labelKey) && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label || labelKey}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-colors text-sm ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly labelKey?: string;
  readonly error?: string;
}

export function TextArea({ label, labelKey, error, className = "", ...props }: TextAreaProps): React.ReactElement {
  return (
    <div className="w-full">
      {(label || labelKey) && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label || labelKey}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-colors text-sm resize-none ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: "default" | "secondary" | "success" | "warning" | "danger";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps): React.ReactElement {
  const variants = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
    secondary: "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
    success: "bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400",
    warning: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    danger: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
