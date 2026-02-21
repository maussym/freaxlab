import { useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import DiagnosisCard from "./DiagnosisCard";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import type { DiagnosisItem } from "../types";

export interface Message {
  id: string;
  role: "user" | "ai";
  text?: string;
  diagnoses?: DiagnosisItem[];
  loading?: boolean;
}

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      <div
        className="w-1.5 h-1.5 bg-qaz-lime/60 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-1.5 h-1.5 bg-qaz-lime/60 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-1.5 h-1.5 bg-qaz-lime/60 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

export default function ChatWindow({
  messages,
  loading,
  onSend,
  onBack,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm px-4 lg:px-6 py-3 flex items-center gap-4 z-10">
        <button
          onClick={onBack}
          className="text-white/50 hover:text-white font-mono text-xs tracking-wider transition-colors cursor-pointer"
        >
          {t("chat.back")}
        </button>
        <div className="h-4 w-px bg-white/20" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-qaz-lime rounded-full animate-pulse" />
          <span className="font-mono text-white text-sm tracking-wider">
            MEDASSIST<span className="text-qaz-lime">.KZ</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher />
          <span className="hidden lg:inline font-mono text-white/30 text-[10px]">
            {t("chat.sessionInfo")}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex flex-col items-center gap-3 opacity-40">
                <svg
                  viewBox="0 0 120 40"
                  className="w-24 text-qaz-lime"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="0,20 30,20 40,5 50,35 60,10 70,25 80,20 120,20" />
                </svg>
                <p className="font-mono text-white/60 text-xs">
                  {t("chat.emptyHint")}
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-white/30 tracking-wider">
                        {t("chat.patient")}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-qaz-lime rounded-full" />
                      <span className="font-mono text-[10px] text-qaz-lime/60 tracking-wider">
                        MEDASSIST AI
                      </span>
                    </div>

                    {msg.loading ? (
                      <TypingIndicator />
                    ) : (
                      <div className="space-y-3">
                        {msg.text && (
                          <p className="font-mono text-sm text-white/70 leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                        {msg.diagnoses?.map((d) => (
                          <DiagnosisCard key={d.rank} item={d} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={loading} />
    </div>
  );
}
