"use client";
// components/export/ExportButtons.tsx
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";
import type { Episode } from "@/drizzle/schema";

interface ExportButtonsProps {
  episodes: Episode[];
}

function toExcelRows(episodes: Episode[]) {
  return episodes.map((e) => ({
    Date: e.date,
    Intensity: e.intensity ?? "",
    Notes: e.notes ?? "",
    "Logged at": new Date(e.createdAt).toLocaleString(),
  }));
}

function exportToExcel(episodes: Episode[]) {
  const ws = XLSX.utils.json_to_sheet(toExcelRows(episodes));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Headache Episodes");

  // Column widths
  ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 50 }, { wch: 20 }];

  XLSX.writeFile(
    wb,
    `headache-episodes-${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

async function exportToPDF(episodes: Episode[]) {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Headache Episodes", 14, 16);
  doc.setFontSize(10);
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 24);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Intensity", "Notes"]],
    body: episodes.map((e) => [
      e.date,
      e.intensity != null ? `${e.intensity}/10` : "—",
      e.notes ?? "—",
    ]),
    headStyles: { fillColor: [99, 102, 241] },
    alternateRowStyles: { fillColor: [245, 245, 255] },
    columnStyles: { 2: { cellWidth: 100 } },
  });

  doc.save(`headache-episodes-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function ExportButtons({ episodes }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"excel" | "pdf" | null>(null);

  const handleExcel = () => {
    setLoading("excel");
    try {
      exportToExcel(episodes);
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = async () => {
    setLoading("pdf");
    try {
      await exportToPDF(episodes);
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={episodes.length === 0}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export ({episodes.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExcel} disabled={loading === "excel"}>
          Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF} disabled={loading === "pdf"}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
