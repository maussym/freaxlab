import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import type { ChatSession } from "../hooks/useSessions";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return d.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

export default function ChatSidebar({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}: Props) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = search
    ? sessions.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      )
    : sessions;

  const sidebar = (
    <div className="flex flex-col h-full bg-black border-r border-white/10">
      <div className="p-3 border-b border-white/10">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-qaz-lime/10 border border-qaz-lime/30 text-qaz-lime font-mono text-xs tracking-wider py-2.5 rounded-lg hover:bg-qaz-lime/20 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
          </svg>
          {t("sidebar.newChat")}
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <svg
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 111.06-1.06l2.755 2.754a.75.75 0 11-1.06 1.06l-2.755-2.754zM10.5 7a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
              clipRule="evenodd"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("sidebar.search")}
            className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-1.5 font-mono text-[11px] text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-mono text-[10px] text-white/20">
              {search ? t("sidebar.noResults") : t("sidebar.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelect(session.id)}
                className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                  session.id === activeId
                    ? "bg-qaz-lime/10 border border-qaz-lime/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-mono text-[11px] truncate leading-tight ${
                      session.id === activeId ? "text-white" : "text-white/60"
                    }`}
                  >
                    {session.title || t("sidebar.untitled")}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[9px] text-white/20">
                      {formatDate(session.updatedAt)}
                    </span>
                    <span className="font-mono text-[9px] text-white/15">
                      {session.messages.filter((m) => m.role === "user").length} msg
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0 mt-0.5 cursor-pointer"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      d="M5 3.25V4H2.75a.75.75 0 000 1.5h.3l.815 8.15A1.5 1.5 0 005.357 15h5.285a1.5 1.5 0 001.493-1.35l.815-8.15h.3a.75.75 0 000-1.5H11v-.75A2.25 2.25 0 008.75 1h-1.5A2.25 2.25 0 005 3.25zm2.25-.75a.75.75 0 00-.75.75V4h3v-.75a.75.75 0 00-.75-.75h-1.5zM6.05 6a.75.75 0 01.787.713l.275 5.5a.75.75 0 01-1.498.075l-.275-5.5A.75.75 0 016.05 6zm3.9 0a.75.75 0 01.712.787l-.275 5.5a.75.75 0 01-1.498-.075l.275-5.5a.75.75 0 01.786-.711z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10">
        <p className="font-mono text-[9px] text-white/15 text-center">
          {t("sidebar.storedLocally")}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0">{sidebar}</div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <div className="relative w-72 h-full animate-slide-in-left">
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}
