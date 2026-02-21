import { useInView } from "../hooks/useInView";
import { useI18n } from "../i18n/I18nContext";
import { sectionShell } from "../lib/layout";

const partners = [
  { name: "QAZCODE", highlight: true, href: "https://qazcode.com" },
  { name: "BEELINE KAZAKHSTAN", highlight: true, href: "https://beeline.kz" },
  { name: "VEON GROUP", highlight: true, href: "https://www.veon.com" },
  { name: "MEETKAI", highlight: true, href: "https://www.meetkai.com" },
  { name: "GSMA", highlight: true, href: "https://www.gsma.com" },
  { name: "DAR TECH", highlight: true, href: "https://dar.io" },
  { name: "НИТ", highlight: true, href: "https://nit.gov.kz" },
  { name: "DATASCI", highlight: true, href: "https://www.datasci.website" },
  { name: "SEERKR", highlight: false, href: "https://seerkr.com" },
  { name: "GPT-OSS", highlight: false, href: "https://hub.qazcode.ai" },
  { name: "FASTAPI", highlight: false, href: "https://fastapi.tiangolo.com" },
  { name: "PYTHON", highlight: false, href: "https://python.org" },
];

export default function Partners() {
  const { ref, visible } = useInView(0.2);
  const { t } = useI18n();

  return (
    <section ref={ref} className="relative bg-black py-16 lg:py-24 overflow-hidden border-t border-white/5">
      <div className={`relative ${sectionShell}`}>
        <div className="flex items-center gap-3 mb-10 lg:mb-14">
          <div className="w-8 h-px bg-qaz-lime" />
          <span className="font-mono text-qaz-lime text-[10px] tracking-wider">
            004 &mdash; {t("partners.sectionTag")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <h2
          className={`font-mono text-xl lg:text-3xl font-bold text-white tracking-wider mb-10 lg:mb-14 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {t("partners.title")} <span className="text-qaz-lime">{t("partners.titleAccent")}</span>
        </h2>
      </div>

      <div className={sectionShell}>
        <div
          className={`relative overflow-hidden transition-all duration-700 delay-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 lg:w-32 bg-linear-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-16 lg:w-32 bg-linear-to-l from-black to-transparent z-10" />

          <div className="flex ticker-scroll">
            {[...partners, ...partners].map((p, i) => (
              <a
                key={`${p.name}-${i}`}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 mx-4 lg:mx-8 flex items-center gap-3 group pointer-events-auto"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    p.highlight ? "bg-qaz-lime" : "bg-white/30"
                  }`}
                />
                <span
                  className={`font-mono text-lg lg:text-2xl font-bold tracking-wider whitespace-nowrap transition-colors ${
                    p.highlight
                      ? "text-qaz-lime/80 group-hover:text-qaz-lime"
                      : "text-white/20 group-hover:text-white/40"
                  }`}
                >
                  {p.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
