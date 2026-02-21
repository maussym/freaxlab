import { useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useI18n } from "../i18n/I18nContext";

interface CounterProps {
  end: number;
  suffix: string;
  label: string;
  active: boolean;
  delay: number;
}

function AnimatedCounter({ end, suffix, label, active, delay }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timeout = setTimeout(() => {
      const duration = 1500;
      const steps = 40;
      const increment = end / steps;
      let current = 0;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), end);
        setCount(current);
        if (step >= steps) clearInterval(interval);
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [active, end, delay]);

  return (
    <div className="text-center">
      <div className="font-mono text-3xl lg:text-5xl font-bold text-qaz-lime mb-2">
        {active ? count : 0}
        <span className="text-qaz-lime/60">{suffix}</span>
      </div>
      <div className="font-mono text-[10px] lg:text-xs text-white/40 tracking-wider uppercase">
        {label}
      </div>
    </div>
  );
}

export default function AboutProject() {
  const { ref, visible } = useInView(0.2);
  const { t } = useI18n();

  const stats = [
    { end: 1000, suffix: "+", label: t("about.stat1") },
    { end: 14000, suffix: "+", label: t("about.stat2") },
    { end: 5, suffix: t("about.stat3Suffix"), label: t("about.stat3") },
  ];

  // Parse description with <accent> tags
  const descParts = t("about.description").split(/<accent>(.*?)<\/accent>/);

  return (
    <section ref={ref} className="relative bg-black py-20 lg:py-28 overflow-hidden">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.02]" />

      <div className="relative container mx-auto px-6 lg:px-16">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <div className="w-8 h-px bg-qaz-lime" />
          <span className="font-mono text-qaz-lime text-[10px] tracking-wider">
            003 &mdash; {t("about.sectionTag")}
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            className={`font-mono text-2xl lg:text-4xl font-bold text-white tracking-wider mb-6 transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {t("about.title")} <span className="text-qaz-lime">{t("about.titleAccent")}</span>
          </h2>
          <p
            className={`font-mono text-sm lg:text-base text-white/50 leading-relaxed transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {descParts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="text-qaz-lime">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>

        {/* Stats */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 transition-all duration-700 delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((s, i) => (
            <div key={s.label} className="relative">
              {i > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
              )}
              <AnimatedCounter
                end={s.end}
                suffix={s.suffix}
                label={s.label}
                active={visible}
                delay={i * 200}
              />
            </div>
          ))}
        </div>

        {/* Decorative bottom bar */}
        <div className="flex items-center gap-2 mt-16 opacity-30">
          <div className="flex-1 h-px bg-white/20" />
          <div className="flex gap-1">
            {[6, 12, 8, 16, 10, 14, 7, 11, 9, 15, 6, 13].map((h, i) => (
              <div
                key={i}
                className="w-0.5 bg-qaz-lime/40"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
          <div className="flex-1 h-px bg-white/20" />
        </div>
      </div>
    </section>
  );
}
