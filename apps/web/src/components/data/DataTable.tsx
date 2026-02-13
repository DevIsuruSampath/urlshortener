"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = "No data",
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyText?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="table-wrap">
      <table className="tier-table dash-responsive-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="muted" data-label="Status">
                {emptyText}
              </td>
            </tr>
          ) : (
            <AnimatePresence initial={false}>
              {rows.map((row, index) => (
                <motion.tr
                  key={rowKey(row, index)}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={reduce ? undefined : { duration: 0.22, ease: "easeOut" }}
                >
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.header}>
                      {column.render(row)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );
}
