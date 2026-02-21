import { useEffect, useRef, useState } from "react";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import DiagnosisCard from "./DiagnosisCard";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n/I18nContext";
import type { DiagnosisItem } from "../types";
import type { ChatSession } from "../hooks/useSessions";

export interface Message {
  id: string;
  role: "user" | "ai";
  text?: string;
  diagnoses?: DiagnosisItem[];
  loading?: boolean;
  ts?: number;
}

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

function TypingIndicator() {
  const { t } = useI18n();
  const stages = [
    t("chat.analyzing"),
    t("chat.matching"),
    t("chat.generating"),
  ];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((s) => (s < stages.length - 1 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(timer);
  }, [stages.length]);

  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="flex items-center gap-1.5">
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
      <span className="font-mono text-xs text-qaz-lime/50 animate-pulse">
        {stages[stage]}
      </span>
    </div>
  );
}

function formatTime(ts?: number) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function WelcomeScreen({ onExample }: { onExample: (text: string) => void }) {
  const { t } = useI18n();
  const examples = [
    t("chat.example1"),
    t("chat.example2"),
    t("chat.example3"),
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 lg:py-20 animate-fade-in">
      <div className="mb-6 opacity-40">
        <svg
          viewBox="0 0 120 40"
          className="w-24 text-qaz-lime"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="0,20 30,20 40,5 50,35 60,10 70,25 80,20 120,20" />
        </svg>
      </div>

      <div className="max-w-md text-center mb-8">
        <p className="font-mono text-sm text-white/70 leading-relaxed">
          {t("chat.welcome")}
        </p>
      </div>

      <p className="font-mono text-[10px] text-white/30 tracking-wider mb-4">
        {t("chat.welcomeHint")}
      </p>
      <div className="flex flex-col gap-2 w-full max-w-md px-4">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={() => onExample(ex)}
            className="group text-left font-mono text-xs text-white/50 bg-white/3 border border-white/8 rounded-lg px-4 py-3 hover:border-qaz-lime/30 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
          >
            <span className="text-qaz-lime/50 group-hover:text-qaz-lime mr-2">
              {String(i + 1).padStart(2, "0")}
            </span>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({
  messages,
  loading,
  onSend,
  onBack,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-black">
      <ChatSidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={(id) => {
          onSelectSession(id);
          setSidebarOpen(false);
        }}
        onNew={() => {
          onNewSession();
          setSidebarOpen(false);
        }}
        onDelete={onDeleteSession}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm px-4 lg:px-6 py-3 flex items-center gap-3 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path
                fillRule="evenodd"
                d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
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
              FREAX<span className="text-qaz-lime">.LAB</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <LanguageSwitcher />
            <span className="hidden lg:inline font-mono text-white/30 text-[10px]">
              {t("chat.sessionInfo")}
            </span>
          </div>
        </div>

        <div className="border-b border-white/5 bg-white/2 px-4 py-1.5 flex items-center justify-center">
          <span className="font-mono text-[9px] text-white/30 tracking-wide">
            {t("chat.disclaimer")}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <WelcomeScreen onExample={onSend} />
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="animate-slide-up">
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-md bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-white/30 tracking-wider">
                            {t("chat.patient")}
                          </span>
                          <span className="font-mono text-[10px] text-white/20 ml-auto">
                            {formatTime(msg.ts)}
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
                            FREAXLAB AI
                          </span>
                          {!msg.loading && (
                            <span className="font-mono text-[10px] text-white/20 ml-auto">
                              {formatTime(msg.ts)}
                            </span>
                          )}
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
                            {msg.diagnoses?.map((d, i) => (
                              <DiagnosisCard key={d.rank} item={d} index={i} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        <ChatInput onSend={onSend} disabled={loading} hasMessages={messages.length > 0} />
      </div>
    </div>
  );
}
