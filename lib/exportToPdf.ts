// lib/exportToPdf.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportPdfOptions {
  title: string;
  filename: string;
  columns: string[];
  rows: (string | number)[][];
  subtitle?: string;
  footer?: string[]; // optional totals row
}

export function exportToPdf({ title, filename, columns, rows, subtitle, footer }: ExportPdfOptions) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(subtitle ?? `Generated: ${new Date().toLocaleString("en-MY")}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [55, 65, 81] },
    foot: footer ? [footer] : undefined,
    footStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: "bold" },
  });

  doc.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`);
}