import { useI18n } from "../i18n/I18nContext";
import type { Locale } from "../i18n/translations";

const locales: { code: Locale; label: string }[] = [
  { code: "kk", label: "ҚАЗ" },
  { code: "ru", label: "РУС" },
  { code: "en", label: "ENG" },
];

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {locales.map((l, i) => (
        <span key={l.code} className="flex items-center">
          {i > 0 && <span className="text-white/20 mx-1 font-mono text-[10px]">/</span>}
          <button
            onClick={() => setLocale(l.code)}
            className={`font-mono text-[10px] tracking-wider transition-colors cursor-pointer ${
              locale === l.code
                ? "text-qaz-lime font-bold"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  );
}
