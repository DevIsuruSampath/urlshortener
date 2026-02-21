"use client";

import * as RDM from "@radix-ui/react-dropdown-menu";
import { useState } from "react";

import { Button } from "./Button";

type Item = {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
};

export function DropdownMenu({ label = "Actions", items }: { label?: string; items: Item[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <RDM.Root onOpenChange={setIsOpen}>
      <RDM.Trigger asChild>
        <Button type="button" variant="secondary" className="btn-small">
          {label}
        </Button>
      </RDM.Trigger>

      <RDM.Portal>
        <RDM.Content asChild sideOffset={6} align="end">
          <div className={`ui-dropdown ${isOpen ? 'ui-dropdown-open' : ''}`}>
            {items.map((item) => (
              <RDM.Item
                key={item.label}
                className={`ui-dropdown-item ${item.tone === "danger" ? "danger" : ""}`}
                onSelect={item.onSelect}
              >
                {item.label}
              </RDM.Item>
            ))}
          </div>
        </RDM.Content>
      </RDM.Portal>
    </RDM.Root>
  );
}
