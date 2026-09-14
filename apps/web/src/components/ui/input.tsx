import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  readonly error?: string;
}

export function Input({ className, error, id, ...props }: InputProps): React.ReactElement {
  return (
    <input
      id={id}
      aria-invalid={error !== undefined && error !== "" ? true : undefined}
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30",
        error !== undefined && error !== "" ? "border-destructive" : "",
        className,
      )}
      {...props}
    />
  );
}
