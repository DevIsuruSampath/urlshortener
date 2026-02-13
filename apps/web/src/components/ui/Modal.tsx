"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
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
              <Dialog.Overlay className="ui-overlay-backdrop" />

              <Dialog.Content asChild>
                <motion.section
                  className={cx("ui-modal", mode === "drawer" && "ui-drawer")}
                  initial={reduce ? false : mode === "drawer" ? { y: 28, opacity: 0.98 } : { y: 12, opacity: 0 }}
                  animate={reduce ? undefined : { y: 0, opacity: 1 }}
                  exit={reduce ? undefined : mode === "drawer" ? { y: 28, opacity: 0.98 } : { y: 8, opacity: 0 }}
                  transition={
                    reduce
                      ? undefined
                      : mode === "drawer"
                        ? { type: "spring", stiffness: 420, damping: 34, mass: 0.9 }
                        : { type: "spring", stiffness: 380, damping: 30, mass: 0.85 }
                  }
                >
                  <header className="ui-modal-head">
                    <Dialog.Title asChild>
                      <h3>{title || "Dialog"}</h3>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button type="button" className="btn btn-ghost btn-small">
                        Close
                      </button>
                    </Dialog.Close>
                  </header>
                  <div className="ui-modal-body">{children}</div>
                </motion.section>
              </Dialog.Content>
            </motion.div>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
