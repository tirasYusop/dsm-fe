"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToPdf } from "@/lib/exportToPdf";

interface ExportButtonProps {
  title: string;
  filename: string;
  columns: string[];
  rows: (string | number)[][];
  subtitle?: string;
  footer?: string[];
  label?: string;
}

export default function ExportButton({ label = "Eksport PDF", disabled, ...opts }: ExportButtonProps & { disabled?: boolean }) {
  return (
    <Button
      variant="outline"
      disabled={disabled || opts.rows.length === 0}
      onClick={() => exportToPdf(opts)}
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}