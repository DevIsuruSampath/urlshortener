import type { CSSProperties, ReactNode } from "react";

type Space = 1 | 2 | 3 | 4 | 5 | 6;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Grid({
  children,
  min = 220,
  gap = 3,
  className,
}: {
  children: ReactNode;
  min?: number;
  gap?: Space;
  className?: string;
}) {
  const style = {
    "--grid-gap": `var(--space-${gap})`,
    "--grid-min": `${min}px`,
  } as CSSProperties;

  return (
    <div className={cx("ui-grid", className)} style={style}>
      {children}
    </div>
  );
}
