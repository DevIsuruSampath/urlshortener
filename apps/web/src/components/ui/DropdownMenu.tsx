"use client";

import * as RDM from "@radix-ui/react-dropdown-menu";

import { Button } from "./Button";

type Item = {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
};

export function DropdownMenu({ label = "Actions", items }: { label?: string; items: Item[] }) {
  return (
    <RDM.Root>
      <RDM.Trigger asChild>
        <Button type="button" variant="secondary" className="btn-small">
          {label}
        </Button>
      </RDM.Trigger>

      <RDM.Portal>
        <RDM.Content className="ui-dropdown" sideOffset={6} align="end">
          {items.map((item) => (
            <RDM.Item
              key={item.label}
              className={`ui-dropdown-item ${item.tone === "danger" ? "danger" : ""}`}
              onSelect={item.onSelect}
            >
              {item.label}
            </RDM.Item>
          ))}
        </RDM.Content>
      </RDM.Portal>
    </RDM.Root>
  );
}
