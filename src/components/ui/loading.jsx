import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className, size = "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2 
      className={cn("animate-spin text-primary", sizeClasses[size], className)} 
    />
  );
}

export function LoadingOverlay({ message = "Loading...", className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      <LoadingSpinner size="lg" className="mb-2" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

export function TableLoadingState({ colSpan = 4, message = "Loading data..." }) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-24 w-full">
        <div className="flex items-center justify-center">
          <LoadingSpinner className="mr-2" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </td>
    </tr>
  );
}

export function CardLoadingState({ className }) {
  return (
    <div className={cn("flex items-center justify-center h-[140px]", className)}>
      <LoadingSpinner />
    </div>
  );
}

export default function Loading({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
          <LoadingSpinner size="xl" className="mb-4" />
          <p className="text-lg font-medium">Loading data...</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full flex items-center justify-center p-8">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
} 