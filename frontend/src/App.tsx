import { useState } from "react";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import AboutProject from "./components/AboutProject";
import Partners from "./components/Partners";
import Footer from "./components/Footer";
import ChatWindow, { type Message } from "./components/ChatWindow";
import { fetchDiagnosis } from "./api";
import { useI18n } from "./i18n/I18nContext";
import "./App.css";

type View = "hero" | "chat";

let msgId = 0;
const nextId = () => String(++msgId);

export default function App() {
  const [view, setView] = useState<View>("hero");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSend = async (text: string) => {
    const userMsg: Message = { id: nextId(), role: "user", text };
    const aiPlaceholder: Message = {
      id: nextId(),
      role: "ai",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setLoading(true);

    try {
      const data = await fetchDiagnosis({ symptoms: text });
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiPlaceholder.id
            ? {
                ...m,
                loading: false,
                text: `${data.diagnoses.length} ${t("chat.foundDiagnoses")}`,
                diagnoses: data.diagnoses,
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiPlaceholder.id
            ? {
                ...m,
                loading: false,
                text:
                  err instanceof Error
                    ? `${t("chat.error")}: ${err.message}`
                    : t("chat.unknownError"),
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={view === "hero" ? "" : "hidden"}>
        <HeroSection onStart={() => setView("chat")} />
        <HowItWorks />
        <AboutProject />
        <Partners />
        <Footer />
      </div>
      <div className={view === "chat" ? "" : "hidden"}>
        <ChatWindow
          messages={messages}
          loading={loading}
          onSend={handleSend}
          onBack={() => setView("hero")}
        />
      </div>
    </>
  );
}
