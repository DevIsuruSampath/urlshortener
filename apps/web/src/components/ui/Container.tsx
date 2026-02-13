import type { ReactNode } from "react";

type Size = "narrow" | "default" | "wide";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Container({ children, size = "default", className }: { children: ReactNode; size?: Size; className?: string }) {
  return <div className={cx("container ui-container", `ui-container-${size}`, className)}>{children}</div>;
}
