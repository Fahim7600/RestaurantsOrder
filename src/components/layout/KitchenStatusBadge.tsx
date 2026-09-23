"use client";

import { useKitchenStatus } from "@/hooks/useKitchenStatus";
import { cn } from "@/lib/utils";

interface KitchenStatusBadgeProps {
  className?: string;
}

/**
 * Compact live-updating badge in the Navbar.
 * Always visible — shows "Closed" when outside opening hours.
 */
export default function KitchenStatusBadge({ className }: KitchenStatusBadgeProps) {
  const status = useKitchenStatus();
  const isClosed = status.tier === "closed";

  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "border text-xs font-medium select-none cursor-default transition-colors duration-500",
        isClosed
          ? "bg-muted/40 border-border/40"
          : "bg-secondary/80 border-border/60",
        className
      )}
      aria-label={status.ariaLabel}
      title={`${status.label}${!isClosed ? ` — ${status.waitRange}` : ""}\n${status.message}`}
      role="status"
    >
      {/* Status dot */}
      <span
        className={cn(
          "w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-500",
          status.dotColor,
          ["rush", "full"].includes(status.tier) && "animate-pulse"
        )}
        aria-hidden="true"
      />

      {/* Label */}
      <span className={cn("leading-none", isClosed ? "text-muted-foreground" : "text-foreground/80")}>
        <span className={cn("font-semibold", isClosed ? "text-muted-foreground" : "text-foreground")}>
          {status.label}
        </span>
        {!isClosed && (
          <>
            {" · "}
            <span className="text-muted-foreground">{status.waitRange}</span>
          </>
        )}
      </span>
    </div>
  );
}
