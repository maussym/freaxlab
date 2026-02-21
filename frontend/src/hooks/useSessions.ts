import { useState, useCallback } from "react";
import type { Message } from "../components/ChatWindow";

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "freaxlab-sessions";
const MAX_SESSIONS = 50;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {}
}

function extractTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user" && m.text);
  if (!first?.text) return "";
  return first.text.length > 60 ? first.text.slice(0, 60) + "..." : first.text;
}

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  const createSession = useCallback(() => {
    const session: ChatSession = {
      id: generateId(),
      title: "",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => {
      const next = [session, ...prev];
      saveSessions(next);
      return next;
    });
    setActiveId(session.id);
    return session.id;
  }, []);

  const updateMessages = useCallback(
    (sessionId: string, messages: Message[]) => {
      setSessions((prev) => {
        const next = prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages,
                title: extractTitle(messages) || s.title,
                updatedAt: Date.now(),
              }
            : s
        );
        saveSessions(next);
        return next;
      });
    },
    []
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        const next = prev.filter((s) => s.id !== sessionId);
        saveSessions(next);
        return next;
      });
      if (activeId === sessionId) {
        setActiveId(null);
      }
    },
    [activeId]
  );

  const switchSession = useCallback((sessionId: string) => {
    setActiveId(sessionId);
  }, []);

  return {
    sessions,
    activeId,
    activeSession,
    createSession,
    updateMessages,
    deleteSession,
    switchSession,
    setActiveId,
  };
}
