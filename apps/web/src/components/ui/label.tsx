import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>): React.ReactElement {
  return (
    <label
      className={cn("block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
