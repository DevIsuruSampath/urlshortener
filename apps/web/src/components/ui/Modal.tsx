"use client";

import type { ReactNode } from "react";

type ModalMode = "modal" | "drawer";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Modal({
  open,
  title,
  onClose,
  children,
  mode = "modal",
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  mode?: ModalMode;
}) {
  if (!open) return null;

  return (
    <div className="ui-overlay" role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
      <button type="button" className="ui-overlay-backdrop" onClick={onClose} aria-label="Close dialog" />
      <section className={cx("ui-modal", mode === "drawer" && "ui-drawer")}>
        <header className="ui-modal-head">
          <h3>{title || "Dialog"}</h3>
          <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
      </section>
    </div>
  );
}
