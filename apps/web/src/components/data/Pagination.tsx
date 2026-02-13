"use client";

import { Button } from "@/components/ui/Button";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}) {
  const safeTotal = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotal);

  return (
    <div className="ui-pagination" aria-label="Pagination">
      <Button type="button" variant="secondary" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
        Prev
      </Button>
      <p className="muted">
        Page {safePage} / {safeTotal}
      </p>
      <Button type="button" variant="secondary" disabled={safePage >= safeTotal} onClick={() => onPageChange(safePage + 1)}>
        Next
      </Button>
    </div>
  );
}
