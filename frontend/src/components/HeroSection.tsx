import { useEffect, useRef } from "react";
import qazLogo from "../assets/logo.webp";
import { useI18n } from "../i18n/I18nContext";
import { sectionShell } from "../lib/layout";
import LanguageSwitcher from "./LanguageSwitcher";

interface Props {
  onStart: () => void;
}

export default function HeroSection({ onStart }: Props) {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const embedScript = document.createElement("script");
    embedScript.type = "text/javascript";
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    const style = document.createElement("style");
    style.textContent = `
      [data-us-project] {
        position: relative !important;
        overflow: hidden !important;
      }
      [data-us-project] canvas {
        clip-path: inset(0 0 10% 0) !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    // Branding cleanup — run a few times then stop (no infinite interval!)
    const hideBranding = () => {
      const projectDiv = document.querySelector("[data-us-project]");
      if (projectDiv) {
        projectDiv.querySelectorAll("*").forEach((el) => {
          const text = (el.textContent || "").toLowerCase();
          if (text.includes("made with") || text.includes("unicorn")) {
            el.remove();
          }
        });
      }
    };

    const t1 = setTimeout(hideBranding, 500);
    const t2 = setTimeout(hideBranding, 1500);
    const t3 = setTimeout(hideBranding, 3000);
    const t4 = setTimeout(hideBranding, 5000);

    // Pause canvas when hero is out of viewport → saves GPU
    const section = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const canvas = document.querySelector(
          "[data-us-project] canvas"
        ) as HTMLCanvasElement | null;
        if (!canvas) return;
        if (entry.isIntersecting) {
          canvas.style.visibility = "visible";
        } else {
          canvas.style.visibility = "hidden";
        }
      },
      { threshold: 0 }
    );
    if (section) observer.observe(section);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      observer.disconnect();
      document.head.removeChild(embedScript);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-black flex flex-col"
    >
      {/* UnicornStudio animation — desktop, GPU-promoted layer */}
      <div className="absolute inset-0 w-full h-full hidden lg:block will-change-transform">
        <div
          data-us-project="whwOGlfJ5Rz2rHaEUgHl"
          style={{ width: "100%", height: "100%", minHeight: "100vh" }}
        />
      </div>

      {/* Mobile stars background */}
      <div className="absolute inset-0 w-full h-full lg:hidden stars-bg" />

      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 scanlines opacity-[0.03]" />

      {/* Top header */}
      <div className="absolute top-0 left-0 right-0 z-20 border-b border-white/20">
        <div className={`${sectionShell} py-3 lg:py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3 lg:gap-4">
            <img
              src={qazLogo}
              alt="QazCode"
              className="h-5 lg:h-6 invert"
            />
            <div className="h-3 lg:h-4 w-px bg-white/40" />
            <span className="font-mono text-white text-sm lg:text-base font-bold tracking-wider">
              FREAX<span className="text-qaz-lime">.LAB</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-white/60">
              <span>ICD-10 COMPATIBLE</span>
              <div className="w-1 h-1 bg-qaz-lime rounded-full animate-pulse" />
              <span>GPT-OSS POWERED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-l-2 border-white/30 z-20" />
      <div className="absolute top-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 z-20" />
      <div className="absolute bottom-0 left-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-l-2 border-white/30 z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 z-20" />

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center pt-16 lg:pt-0">
        <div className={sectionShell}>
          <div className="max-w-xl">
            {/* Top decorative line */}
            <div className="flex items-center gap-2 mb-3 opacity-60">
              <div className="w-8 h-px bg-qaz-lime" />
              <span className="text-qaz-lime text-[10px] font-mono tracking-wider">
                001 &mdash; {t("hero.tagline")}
              </span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            {/* Title */}
            <div className="relative">
              <div className="hidden lg:block absolute -left-4 top-0 bottom-0 w-1 dither-pattern opacity-40" />
              <h1
                className="text-3xl lg:text-6xl font-bold text-white mb-2 lg:mb-4 leading-tight font-mono tracking-wider"
                style={{ letterSpacing: "0.08em" }}
              >
                {t("hero.title1")}
                <span className="block text-qaz-lime mt-1 lg:mt-2">
                  {t("hero.title2")}
                </span>
                <span className="block text-white/80 mt-1 lg:mt-2 text-2xl lg:text-4xl">
                  {t("hero.title3")}
                </span>
              </h1>
            </div>

            {/* Dots */}
            <div className="hidden lg:flex gap-1 mb-3 opacity-40">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-0.5 bg-qaz-lime rounded-full"
                />
              ))}
            </div>

            {/* Description */}
            <p className="text-xs lg:text-base text-gray-300 mb-6 lg:mb-8 leading-relaxed font-mono opacity-80 max-w-md">
              {t("hero.description")}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button
                onClick={onStart}
                className="relative px-6 lg:px-8 py-2.5 lg:py-3 bg-qaz-lime text-black font-mono text-xs lg:text-sm font-bold tracking-wider hover:brightness-110 transition-all duration-200 group cursor-pointer"
              >
                <span className="hidden lg:block absolute -top-1 -left-1 w-2 h-2 border-t border-l border-qaz-lime opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="hidden lg:block absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-qaz-lime opacity-0 group-hover:opacity-100 transition-opacity" />
                {t("hero.startBtn")}
              </button>

              <button className="px-6 lg:px-8 py-2.5 lg:py-3 border border-white/40 text-white font-mono text-xs lg:text-sm tracking-wider hover:bg-white/10 transition-all duration-200 cursor-pointer">
                {t("hero.docsBtn")}
              </button>
            </div>

            {/* Bottom notation */}
            <div className="hidden lg:flex items-center gap-2 mt-8 opacity-40">
              <span className="text-qaz-lime text-[9px] font-mono">+</span>
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/60 text-[9px] font-mono">
                DATASAUR 2026 &middot; QAZCODE CHALLENGE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer — no backdrop-blur for perf */}
      <div className="relative z-20 border-t border-white/20 bg-black/70">
        <div className={`${sectionShell} py-2 lg:py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-3 lg:gap-6 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span>SYSTEM.READY</span>
            <div className="hidden lg:flex gap-1">
              {[14, 8, 12, 6, 16, 10, 7, 13].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-qaz-lime/40"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <span>MKB-10</span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 text-[8px] lg:text-[9px] font-mono text-white/50">
            <span className="hidden lg:inline">TEAM &lt;FREAKS&gt;</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-qaz-lime/80 rounded-full animate-pulse" />
              <div
                className="w-1 h-1 bg-qaz-lime/50 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-1 h-1 bg-qaz-lime/30 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
