import { useState } from "react";
import type { DiagnosisItem } from "../types";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  item: DiagnosisItem;
}

function ConfidenceBar({ value }: { value: number }) {
  const { t } = useI18n();
  const color =
    value >= 70 ? "bg-qaz-lime" : value >= 40 ? "bg-yellow-400" : "bg-red-400";
  const textColor =
    value >= 70
      ? "text-qaz-lime/70"
      : value >= 40
        ? "text-yellow-400/70"
        : "text-red-400/70";

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className={`font-mono text-[10px] ${textColor} whitespace-nowrap`}>
        {t("chat.confidence")} {value}%
      </span>
      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
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
      <div className="flex items-center gap-3 p-4">
        <span className="font-mono text-qaz-lime text-lg font-bold">
          #{item.rank}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-mono text-white text-sm font-semibold block truncate">
            {item.diagnosis}
          </span>
          {item.confidence != null && <ConfidenceBar value={item.confidence} />}
        </div>
        <span className="font-mono text-xs bg-qaz-lime/20 text-qaz-lime px-2 py-0.5 rounded border border-qaz-lime/30 shrink-0">
          {item.icd10_code}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-white/30 transition-transform duration-200 shrink-0 ${
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
