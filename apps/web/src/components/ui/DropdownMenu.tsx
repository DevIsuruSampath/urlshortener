"use client";

import * as RDM from "@radix-ui/react-dropdown-menu";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "./Button";

type Item = {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
};

export function DropdownMenu({ label = "Actions", items }: { label?: string; items: Item[] }) {
  const reduce = useReducedMotion();

  return (
    <RDM.Root>
      <RDM.Trigger asChild>
        <Button type="button" variant="secondary" className="btn-small">
          {label}
        </Button>
      </RDM.Trigger>

      <RDM.Portal>
        <RDM.Content asChild sideOffset={6} align="end">
          <motion.div
            className="ui-dropdown"
            initial={reduce ? false : { opacity: 0, y: 4, scale: 0.98 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 2, scale: 0.98 }}
            transition={reduce ? undefined : { duration: 0.16, ease: "easeOut" }}
          >
            {items.map((item) => (
              <RDM.Item
                key={item.label}
                className={`ui-dropdown-item ${item.tone === "danger" ? "danger" : ""}`}
                onSelect={item.onSelect}
              >
                {item.label}
              </RDM.Item>
            ))}
          </motion.div>
        </RDM.Content>
      </RDM.Portal>
    </RDM.Root>
  );
}
