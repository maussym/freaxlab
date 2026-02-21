import { useI18n } from "../i18n/I18nContext";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="relative bg-black border-t border-white/10">
      <div className="container mx-auto px-6 lg:px-16 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-qaz-lime rounded-full" />
              <span className="font-mono text-white text-sm font-bold tracking-wider">
                MEDASSIST<span className="text-qaz-lime">.KZ</span>
              </span>
            </div>
            <p className="font-mono text-xs text-white/40 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-mono text-[10px] text-white/30 tracking-wider mb-4">
              {t("footer.links")}
            </h4>
            <ul className="space-y-2">
              {[
                { label: "GitHub", href: "https://github.com" },
                { label: "QazCode Challenge", href: "https://qazcode.com" },
                { label: "DataSci", href: "https://www.datasci.website" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-white/50 hover:text-qaz-lime transition-colors"
                  >
                    {link.label}
                    <span className="text-white/20 ml-1">&rarr;</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div>
            <h4 className="font-mono text-[10px] text-white/30 tracking-wider mb-4">
              {t("footer.team")}
            </h4>
            <p className="font-mono text-xs text-white/50 leading-relaxed">
              Team &lt;FREAKS&gt;
            </p>
            <p className="font-mono text-xs text-white/30 mt-2">
              Datasaur 2026 &middot; QazCode Challenge
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-white/30 text-center md:text-left leading-relaxed max-w-lg">
            {t("footer.disclaimer")}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-qaz-lime/60 rounded-full animate-pulse" />
              <div
                className="w-1 h-1 bg-qaz-lime/40 rounded-full animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-1 h-1 bg-qaz-lime/20 rounded-full animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
            <span className="font-mono text-[10px] text-white/20">
              &copy; 2026 MEDASSIST.KZ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
