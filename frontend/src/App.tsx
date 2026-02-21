import { useState, useCallback, useEffect } from "react";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import AboutProject from "./components/AboutProject";
import Partners from "./components/Partners";
import Footer from "./components/Footer";
import ChatWindow, { type Message } from "./components/ChatWindow";
import { fetchDiagnosis } from "./api";
import { useI18n } from "./i18n/I18nContext";
import { useSessions } from "./hooks/useSessions";
import "./App.css";

type View = "hero" | "chat";

let msgId = 0;
const nextId = () => String(++msgId);

export default function App() {
  const [view, setView] = useState<View>("hero");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const {
    sessions,
    activeId,
    activeSession,
    createSession,
    updateMessages,
    deleteSession,
    switchSession,
  } = useSessions();

  const messages = activeSession?.messages ?? [];

  const handleStartChat = useCallback(() => {
    createSession();
    setView("chat");
  }, [createSession]);

  const handleNewSession = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleSelectSession = useCallback(
    (id: string) => {
      switchSession(id);
    },
    [switchSession]
  );

  const handleSend = async (text: string) => {
    let currentActiveId = activeId;
    if (!currentActiveId) {
      currentActiveId = createSession();
    }

    const userMsg: Message = { id: nextId(), role: "user", text, ts: Date.now() };
    const aiPlaceholder: Message = {
      id: nextId(),
      role: "ai",
      loading: true,
    };

    const currentMessages = sessions.find((s) => s.id === currentActiveId)?.messages ?? [];
    const newMessages = [...currentMessages, userMsg, aiPlaceholder];
    updateMessages(currentActiveId, newMessages);
    setLoading(true);

    try {
      const data = await fetchDiagnosis({ symptoms: text });
      const updated = newMessages.map((m) =>
        m.id === aiPlaceholder.id
          ? {
              ...m,
              loading: false,
              ts: Date.now(),
              text: `${data.diagnoses.length} ${t("chat.foundDiagnoses")}`,
              diagnoses: data.diagnoses,
            }
          : m
      );
      updateMessages(currentActiveId, updated);
    } catch (err) {
      const updated = newMessages.map((m) =>
        m.id === aiPlaceholder.id
          ? {
              ...m,
              loading: false,
              ts: Date.now(),
              text:
                err instanceof Error
                  ? `${t("chat.error")}: ${err.message}`
                  : t("chat.unknownError"),
            }
          : m
      );
      updateMessages(currentActiveId, updated);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "chat" && !activeId && sessions.length > 0) {
      switchSession(sessions[0].id);
    }
  }, [view, activeId, sessions, switchSession]);

  return (
    <>
      <div
        className={
          view === "hero"
            ? ""
            : "fixed -top-[200vh] -left-[200vw] invisible pointer-events-none"
        }
      >
        <HeroSection onStart={handleStartChat} />
        <div className="section-lazy">
          <HowItWorks />
        </div>
        <div className="section-lazy">
          <AboutProject />
        </div>
        <div className="section-lazy">
          <Partners />
        </div>
        <Footer />
      </div>
      <div className={view === "chat" ? "" : "hidden"}>
        <ChatWindow
          messages={messages}
          loading={loading}
          onSend={handleSend}
          onBack={() => setView("hero")}
          sessions={sessions}
          activeSessionId={activeId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={deleteSession}
        />
      </div>
    </>
  );
}
