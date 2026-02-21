import { useState } from "react";
import type { DiagnosisItem } from "../types";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  item: DiagnosisItem;
  index?: number;
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

function CopyButton({ item }: { item: DiagnosisItem }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${item.diagnosis} (${item.icd10_code})\n${item.explanation}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="font-mono text-[9px] text-white/30 hover:text-qaz-lime/70 transition-colors flex items-center gap-1 cursor-pointer"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-qaz-lime">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
          <span className="text-qaz-lime/70">{t("chat.copied")}</span>
        </>
      ) : (
        <>
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
            <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
          </svg>
          <span>{t("chat.copy")}</span>
        </>
      )}
    </button>
  );
}

export default function DiagnosisCard({ item, index = 0 }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-lg bg-white/3 transition-all cursor-pointer group animate-slide-up ${
        open ? "border-qaz-lime/30" : "border-white/10 hover:border-qaz-lime/20"
      }`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
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
          <p className="font-mono text-xs text-white/60 leading-relaxed mb-2">
            {item.explanation}
          </p>
          <CopyButton item={item} />
        </div>
      </div>
    </div>
  );
}
