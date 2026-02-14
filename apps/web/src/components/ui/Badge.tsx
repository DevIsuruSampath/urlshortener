import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "default" | "success" | "danger" | "warning";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  tone = "default",
  children,
  className,
  ...props
}: { tone?: BadgeTone; children: ReactNode; className?: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx("ui-badge", `ui-badge-${tone}`, className)} {...props}>
      {children}
    </span>
  );
}
