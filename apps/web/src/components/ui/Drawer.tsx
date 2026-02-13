"use client";

import type { ReactNode } from "react";

import { Modal } from "./Modal";

export function Drawer({ open, title, onClose, children }: { open: boolean; title?: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal open={open} title={title} onClose={onClose} mode="drawer">
      {children}
    </Modal>
  );
}
