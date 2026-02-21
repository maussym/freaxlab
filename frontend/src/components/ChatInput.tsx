import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const { t } = useI18n();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/60 backdrop-blur-sm px-4 lg:px-6 py-3 lg:py-4"
    >
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("chat.placeholder")}
            rows={1}
            disabled={disabled}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white font-mono placeholder-white/30 resize-none focus:outline-none focus:border-qaz-lime/50 transition-colors disabled:opacity-40"
            style={{ minHeight: "44px", maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "44px";
              target.style.height = target.scrollHeight + "px";
            }}
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="px-4 py-3 bg-qaz-lime text-black font-mono text-xs font-bold tracking-wider hover:bg-qaz-lime disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer rounded-lg"
        >
          {disabled ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-black/40 border-t-black rounded-full animate-spin" />
            </span>
          ) : (
            t("chat.send")
          )}
        </button>
      </div>
    </form>
  );
}
