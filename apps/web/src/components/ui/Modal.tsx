"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="ui-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={title || "Dialog"}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={reduce ? undefined : { duration: 0.2 }}
        >
          <button type="button" className="ui-overlay-backdrop" onClick={onClose} aria-label="Close dialog" />
          <motion.section
            className={cx("ui-modal", mode === "drawer" && "ui-drawer")}
            initial={reduce ? false : mode === "drawer" ? { y: 28, opacity: 0.98 } : { y: 12, opacity: 0 }}
            animate={reduce ? undefined : { y: 0, opacity: 1 }}
            exit={reduce ? undefined : mode === "drawer" ? { y: 28, opacity: 0.98 } : { y: 8, opacity: 0 }}
            transition={reduce ? undefined : { duration: 0.22, ease: "easeOut" }}
          >
            <header className="ui-modal-head">
              <h3>{title || "Dialog"}</h3>
              <button type="button" className="btn btn-ghost btn-small" onClick={onClose}>
                Close
              </button>
            </header>
            <div className="ui-modal-body">{children}</div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
