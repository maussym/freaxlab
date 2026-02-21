import { useInView } from "../hooks/useInView";
import { useI18n } from "../i18n/I18nContext";
import { sectionShell } from "../lib/layout";
import type { TranslationKey } from "../i18n/translations";

const icons = [
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 12h12M6 16h8" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 13h6M9 17h4" strokeLinecap="round" />
      <path d="M9 9h1" strokeLinecap="round" />
    </svg>
  ),
];

const stepKeys: { num: string; title: TranslationKey; desc: TranslationKey }[] = [
  { num: "01", title: "how.step1.title", desc: "how.step1.desc" },
  { num: "02", title: "how.step2.title", desc: "how.step2.desc" },
  { num: "03", title: "how.step3.title", desc: "how.step3.desc" },
];

export default function HowItWorks() {
  const { ref, visible } = useInView(0.15);
  const { t } = useI18n();

  return (
    <section ref={ref} className="relative bg-black py-20 lg:py-28 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className={`relative ${sectionShell}`}>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <div className="w-8 h-px bg-qaz-lime" />
          <span className="font-mono text-qaz-lime text-[10px] tracking-wider">
            002 &mdash; {t("how.sectionTag")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2 className="font-mono text-2xl lg:text-4xl font-bold text-white tracking-wider mb-4">
          {t("how.title")} <span className="text-qaz-lime">{t("how.titleAccent")}</span>
        </h2>
        <p className="font-mono text-sm text-white/40 mb-12 lg:mb-16 max-w-lg">
          {t("how.subtitle")}
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stepKeys.map((step, i) => (
            <div
              key={step.num}
              className={`group relative border border-white/10 rounded-lg p-6 lg:p-8 bg-white/2 hover:border-qaz-lime/30 transition-all duration-700 ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-qaz-lime/40 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-qaz-lime/40 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Step number */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-qaz-lime/30 text-4xl font-bold">
                  {step.num}
                </span>
                <div className="text-qaz-lime/60 group-hover:text-qaz-lime transition-colors">
                  {icons[i]}
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/10 mb-4 group-hover:bg-qaz-lime/20 transition-colors" />

              <h3 className="font-mono text-sm font-bold text-white tracking-wider mb-3">
                {t(step.title)}
              </h3>
              <p className="font-mono text-xs text-white/50 leading-relaxed">
                {t(step.desc)}
              </p>

              {/* Connecting line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-4 w-6 lg:w-8 h-px bg-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
