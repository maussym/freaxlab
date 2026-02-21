import type React from "react";
import { useInView } from "../hooks/useInView";
import { useI18n } from "../i18n/I18nContext";
import { sectionShell } from "../lib/layout";

const apiExample = {
  request: `POST /diagnose
Content-Type: application/json

{
  "symptoms": "Головная боль, температура 38.5, боль в горле"
}`,
  response: `{
  "diagnoses": [
    {
      "rank": 1,
      "diagnosis": "Острый бронхит",
      "icd10_code": "J20.9",
      "explanation": "Симптомы соответствуют...",
      "confidence": 85
    }
  ]
}`,
};

const features = [
  { icon: "voice", key: "docs.feat.voice" as const },
  { icon: "i18n", key: "docs.feat.i18n" as const },
  { icon: "history", key: "docs.feat.history" as const },
  { icon: "icd", key: "docs.feat.icd" as const },
];

const featureIcons: Record<string, React.ReactNode> = {
  voice: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12" y2="22" strokeLinecap="round" />
    </svg>
  ),
  i18n: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" strokeLinecap="round" />
    </svg>
  ),
  icd: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  ),
};

const stack = [
  { name: "React 19", desc: "TypeScript + Vite 7" },
  { name: "FastAPI", desc: "Python 3.12 + Uvicorn" },
  { name: "GPT-OSS", desc: "QazCode Hub LLM" },
  { name: "Tailwind v4", desc: "Utility-first CSS" },
  { name: "Web Speech API", desc: "Voice recognition" },
  { name: "Docker", desc: "Multi-stage build" },
];

export default function DocsSection() {
  const { ref, visible } = useInView(0.1);
  const { t } = useI18n();

  return (
    <section id="docs" ref={ref} className="relative bg-black py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className={`relative ${sectionShell}`}>
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <div className="w-8 h-px bg-qaz-lime" />
          <span className="font-mono text-qaz-lime text-[10px] tracking-wider">
            005 &mdash; {t("docs.sectionTag")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-mono text-2xl lg:text-4xl font-bold text-white tracking-wider mb-4">
          {t("docs.title")} <span className="text-qaz-lime">{t("docs.titleAccent")}</span>
        </h2>
        <p className="font-mono text-sm text-white/40 mb-12 lg:mb-16 max-w-lg">
          {t("docs.subtitle")}
        </p>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="w-2 h-2 rounded-full bg-red-400/60" />
              <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
              <div className="w-2 h-2 rounded-full bg-green-400/60" />
              <span className="font-mono text-[10px] text-white/30 ml-2">REQUEST</span>
            </div>
            <pre className="p-4 font-mono text-[11px] text-white/60 leading-relaxed overflow-x-auto">
              {apiExample.request}
            </pre>
          </div>

          <div className="border border-qaz-lime/20 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-qaz-lime/5 border-b border-qaz-lime/20">
              <div className="w-2 h-2 rounded-full bg-qaz-lime/60" />
              <span className="font-mono text-[10px] text-qaz-lime/50 ml-2">RESPONSE</span>
              <span className="font-mono text-[10px] text-qaz-lime/30 ml-auto">200 OK</span>
            </div>
            <pre className="p-4 font-mono text-[11px] text-qaz-lime/50 leading-relaxed overflow-x-auto">
              {apiExample.response}
            </pre>
          </div>
        </div>

        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 lg:mb-16 transition-all duration-700 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          {features.map((f) => (
            <div key={f.key} className="border border-white/10 rounded-lg p-4 bg-white/2 hover:border-qaz-lime/20 transition-colors group">
              <div className="text-qaz-lime/40 group-hover:text-qaz-lime/70 transition-colors mb-3">
                {featureIcons[f.icon]}
              </div>
              <p className="font-mono text-[11px] text-white/50 leading-relaxed">
                {t(f.key)}
              </p>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-700 delay-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}>
          <h3 className="font-mono text-sm font-bold text-white tracking-wider mb-6">
            {t("docs.stack")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stack.map((s) => (
              <div key={s.name} className="border border-white/8 rounded-md px-3 py-2.5 bg-white/2">
                <p className="font-mono text-[11px] text-white/70 font-semibold">{s.name}</p>
                <p className="font-mono text-[9px] text-white/25 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
