"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";

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
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal forceMount>
        <div className="ui-overlay" role="dialog" aria-modal="true" aria-label={title || "Dialog"}>
          <Dialog.Overlay className="ui-overlay-backdrop" />

          <Dialog.Content asChild>
            <section className={cx("ui-modal", mode === "drawer" && "ui-drawer")}>
              <header className="ui-modal-head">
                <Dialog.Title asChild>
                  <h2>{title}</h2>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="ui-modal-close" aria-label="Close">
                    ×
                  </button>
                </Dialog.Close>
              </header>

              <div className="ui-modal-body">{children}</div>
            </section>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}