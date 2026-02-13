import type { ReactNode, SelectHTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Select({
  label,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  if (!label) {
    return (
      <select className={cx("ui-select", className)} {...props}>
        {children}
      </select>
    );
  }

  return (
    <label className="ui-field">
      <span>{label}</span>
      <select className={cx("ui-select", className)} {...props}>
        {children}
      </select>
    </label>
  );
}
