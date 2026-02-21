import { useState } from "react";
import type { DiagnosisItem } from "../types";

interface Props {
  item: DiagnosisItem;
}

export default function DiagnosisCard({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-lg bg-white/3 transition-colors cursor-pointer group ${
        open ? "border-qaz-lime/30" : "border-white/10 hover:border-qaz-lime/20"
      }`}
      onClick={() => setOpen((v) => !v)}
    >
      {/* Header — always visible */}
      <div className="flex items-center gap-3 p-4">
        <span className="font-mono text-qaz-lime text-lg font-bold">
          #{item.rank}
        </span>
        <span className="font-mono text-white text-sm font-semibold flex-1">
          {item.diagnosis}
        </span>
        <span className="font-mono text-xs bg-qaz-lime/20 text-qaz-lime px-2 py-0.5 rounded border border-qaz-lime/30">
          {item.icd10_code}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-white/30 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Explanation — expandable */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-0">
          <div className="h-px bg-white/10 mb-3" />
          <p className="font-mono text-xs text-white/60 leading-relaxed">
            {item.explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
