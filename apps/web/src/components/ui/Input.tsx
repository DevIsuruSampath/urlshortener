import type { InputHTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Input({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  if (!label) {
    return <input className={cx("ui-input", className)} {...props} />;
  }

  return (
    <label className="ui-field">
      <span>{label}</span>
      <input className={cx("ui-input", className)} {...props} />
    </label>
  );
}
