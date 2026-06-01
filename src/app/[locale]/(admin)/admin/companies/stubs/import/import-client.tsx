"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Building2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bulkImportStubOrgsAction,
  type BulkImportRow,
  type BulkImportResult,
} from "@/features/organizations/server/stub-actions";

const HEADERS = [
  "name",
  "slug",
  "website",
  "country",
  "type",
  "main_activity",
  "description",
  "logo_url",
  "tagline",
  "contact_email",
  "phone",
  "address",
  "linkedin_url",
  "x_url",
  "facebook_url",
  "instagram_url",
  "tiktok_url",
  "youtube_url",
] as const;

// Tiny RFC-4180-ish CSV parser (handles quoted fields with commas + escaped quotes)
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") {
        cur.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        cur.push(field);
        field = "";
        if (cur.some((v) => v !== "")) rows.push(cur);
        cur = [];
      } else {
        field += c;
      }
    }
  }
  if (field !== "" || cur.length > 0) {
    cur.push(field);
    if (cur.some((v) => v !== "")) rows.push(cur);
  }
  return rows;
}

export function StubImportClient() {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [results, setResults] = useState<BulkImportResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    setResults(null);
    try {
      const text = await file.text();
      const grid = parseCSV(text);
      if (grid.length < 2) {
        setError("CSV is empty or missing a header row.");
        return;
      }
      const header = grid[0].map((h) => h.trim().toLowerCase());
      const nameIdx = header.indexOf("name");
      if (nameIdx === -1) {
        setError("CSV must include a 'name' column.");
        return;
      }
      const parsed: BulkImportRow[] = [];
      for (let r = 1; r < grid.length; r++) {
        const row = grid[r];
        const obj: BulkImportRow = { row: r + 1 };
        for (const h of HEADERS) {
          const idx = header.indexOf(h);
          if (idx !== -1) {
            const val = (row[idx] ?? "").trim();
            if (val) (obj as Record<string, string | number>)[h] = val;
          }
        }
        parsed.push(obj);
      }
      setRows(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse file.");
    }
  };

  const onImport = () => {
    if (rows.length === 0) return;
    startTransition(async () => {
      const res = await bulkImportStubOrgsAction(rows);
      if (!res.success) {
        toast.error(res.error ?? "Import failed.");
        return;
      }
      setResults(res.results);
      const inserted = res.results.filter((r) => r.status === "inserted").length;
      const skipped = res.results.filter((r) => r.status === "skipped").length;
      const errors = res.results.filter((r) => r.status === "error").length;
      toast.success(
        `Imported ${inserted} • Skipped ${skipped} • Errors ${errors}`
      );
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Companies
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mt-2">
          <Building2 className="h-6 w-6 text-[var(--brand)]" />
          Bulk Import Stub Companies
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload a CSV to seed many placeholder profiles at once. Real owners
          can claim them later.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="text-sm text-gray-300">
          <p className="font-semibold text-white mb-2">CSV format</p>
          <p>
            First row is the header. <code className="text-[var(--brand)]">name</code>{" "}
            is required. <code className="text-[var(--brand)]">slug</code> is
            auto-generated from name if omitted. Supported columns:
          </p>
          <p className="mt-2 font-mono text-xs text-gray-400 break-words">
            {HEADERS.join(", ")}
          </p>
        </div>

        <label className="block">
          <span className="sr-only">Upload CSV</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
            className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--brand)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:bg-[#B5964A]"
          />
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {rows.length > 0 && !results && (
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm">
            <span className="text-gray-300">
              Parsed <span className="font-bold text-white">{rows.length}</span>{" "}
              rows. Ready to import.
            </span>
            <Button
              onClick={onImport}
              disabled={isPending}
              className="bg-[var(--brand)] text-black hover:bg-[#B5964A] font-semibold"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1.5" /> Import {rows.length}{" "}
                  rows
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {results && results.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                <th className="text-left p-3 font-medium">Row</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr
                  key={r.row}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-3 text-gray-400 font-mono">{r.row}</td>
                  <td className="p-3">
                    {r.status === "inserted" && (
                      <span className="inline-flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Inserted
                      </span>
                    )}
                    {r.status === "skipped" && (
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <AlertTriangle className="h-3.5 w-3.5" /> Skipped
                      </span>
                    )}
                    {r.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <XCircle className="h-3.5 w-3.5" /> Error
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs text-gray-300">
                    {r.slug ?? "—"}
                  </td>
                  <td className="p-3 text-gray-400">{r.error ?? "OK"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
