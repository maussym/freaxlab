import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { TranslationKey } from "../i18n/translations";

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  abort(): void;
  onresult: ((event: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
  hasMessages: boolean;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    : null;

const LOCALE_MAP: Record<string, string> = {
  ru: "ru-RU",
  kk: "kk-KZ",
  en: "en-US",
};

const chipKeys: TranslationKey[] = [
  "chat.chip.headache",
  "chat.chip.fever",
  "chat.chip.cough",
  "chat.chip.stomachPain",
  "chat.chip.backPain",
  "chat.chip.nausea",
];

export default function ChatInput({ onSend, disabled, hasMessages }: Props) {
  const [text, setText] = useState("");
  const { t, locale } = useI18n();
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const baseTextRef = useRef("");

  function createRecognition() {
    if (!SpeechRecognitionAPI) return null;
    const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognitionInstance)();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LOCALE_MAP[locale] || "ru-RU";
    return recognition;
  }

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const toggleVoice = () => {
    if (listening) {
      stopListening();
      return;
    }

    if (!SpeechRecognitionAPI) {
      setVoiceError(true);
      setTimeout(() => setVoiceError(false), 3000);
      return;
    }

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    baseTextRef.current = text;
    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim = transcript;
        }
      }
      const base = baseTextRef.current;
      const separator = base && !base.endsWith(" ") ? " " : "";
      setText(base + separator + finalTranscript + interim);
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    if (listening) stopListening();
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const addChip = (chipText: string) => {
    setText((prev) => {
      if (!prev) return chipText;
      const separator = prev.endsWith(", ") ? "" : prev.endsWith(",") ? " " : ", ";
      return prev + separator + chipText.toLowerCase();
    });
    textareaRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/60 backdrop-blur-sm px-4 lg:px-6 py-3 lg:py-4"
    >
      <div className="max-w-3xl mx-auto">
        {!hasMessages && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {chipKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => addChip(t(key))}
                className="font-mono text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full px-3 py-1 hover:border-qaz-lime/30 hover:text-white/70 hover:bg-white/8 transition-all cursor-pointer"
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("chat.placeholder")}
              rows={1}
              disabled={disabled}
              className={`w-full bg-white/5 border rounded-lg px-4 py-3 pr-12 text-sm text-white font-mono placeholder-white/30 resize-none focus:outline-none transition-colors disabled:opacity-40 ${
                listening
                  ? "border-red-400/50 focus:border-red-400/70"
                  : "border-white/15 focus:border-qaz-lime/50"
              }`}
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = target.scrollHeight + "px";
              }}
            />
            {text.length > 0 && (
              <span className="absolute right-3 bottom-3 font-mono text-[9px] text-white/15">
                {text.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleVoice}
            disabled={disabled}
            className={`flex items-center justify-center rounded-lg shrink-0 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              listening
                ? "bg-red-500/20 border border-red-400/40 text-red-400"
                : "bg-white/5 border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30"
            }`}
            style={{ width: "44px", height: "44px" }}
          >
            {listening ? (
              <div className="relative flex items-center justify-center">
                <div className="absolute w-6 h-6 bg-red-400/20 rounded-full animate-ping" />
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
              </div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="22" strokeLinecap="round" />
                <line x1="8" y1="22" x2="16" y2="22" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <button
            type="submit"
            disabled={disabled || !text.trim()}
            className="flex items-center justify-center bg-qaz-lime text-black font-mono text-xs font-bold tracking-wider hover:bg-qaz-lime disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer rounded-lg shrink-0"
            style={{ width: "44px", height: "44px" }}
          >
            {disabled ? (
              <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin block" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="font-mono text-[9px] text-white/15">
            {t("chat.shiftEnter")}
          </span>
          {listening && (
            <span className="font-mono text-[9px] text-red-400/70 animate-pulse">
              {t("chat.voiceListening")}
            </span>
          )}
          {voiceError && (
            <span className="font-mono text-[9px] text-red-400/70">
              {t("chat.voiceNotSupported")}
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
