import type { CSSProperties, ElementType, ReactNode } from "react";

type Space = 1 | 2 | 3 | 4 | 5 | 6;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Stack({
  children,
  gap = 3,
  as,
  className,
}: {
  children: ReactNode;
  gap?: Space;
  as?: ElementType;
  className?: string;
}) {
  const Comp = as || "div";
  const style = { "--stack-gap": `var(--space-${gap})` } as CSSProperties;
  return (
    <Comp className={cx("ui-stack", className)} style={style}>
      {children}
    </Comp>
  );
}
