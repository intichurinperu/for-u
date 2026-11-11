import { Card as DSCard } from '../components/ui/DesignSystem';
import { Textarea as DSTextarea, ButtonPrimary as DSButtonPrimary } from '../components/ui/DesignSystem';
import { useState } from "react";
import { useToolkit } from "./ToolkitContext";
import { askAI } from "./api";
export default function ContextAssistant({
  currentTool,
  currentTask,
}: {
  currentTool: string;
  currentTask?: string;
}) {
  const { business, state, demo, track, projectId } = useToolkit();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function send() {
    if (!draft.trim() || busy) return;
    const prompt = draft.trim();
    const history = [...messages, { role: "user", text: prompt }];
    setMessages(history);
    setDraft("");
    setBusy(true);
    setError("");
    track("help");
    try {
      const text = await askAI("chat", prompt, business, {
        projectId,
        context: { currentTool, currentTask, state },
        history: history.slice(-8),
      });
      setMessages([...history, { role: "assistant", text }]);
    } catch (e) {
      setError((e as Error).message);
      setDraft(prompt);
    } finally {
      setBusy(false);
    }
  }
  return (
    <DSCard as="section" className="tk-card tk-stack tk-assistant">
      <div className="tk-eyebrow">ESTOY AQUÍ CONTIGO</div>
      <h2>Una cosa a la vez</h2>
      <p>
        Estamos en <strong>{currentTool}</strong>, trabajando en {business.name}
        .
      </p>
      <div className="tk-tip">
        {currentTask
          ? `Tu siguiente paso: ${currentTask}.`
          : `Empieza contando un beneficio de ${business.offer} para ${business.audience}.`}{" "}
        Si parece mucho, escribe solo la primera frase.
      </div>
      <div className="tk-chat-messages" aria-live="polite">
        {messages.map((message, i) => (
          <p
            key={i}
            className={`tk-chat-bubble ${message.role === "user" ? "is-user" : ""}`}
          >
            {message.text}
          </p>
        ))}
      </div>
      <form
        className="tk-stack"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <label>
          ¿En qué te ayudo?
          <DSTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={3000}
            placeholder="Dame un ejemplo para mi negocio…"
            rows={3}
          />
        </label>
        <DSButtonPrimary className="tk-primary" disabled={busy || !draft.trim() || demo}>
          {busy ? "Pensando en tu siguiente paso…" : "Conversar con FOR U"}
        </DSButtonPrimary>
      </form>
      {demo && (
        <p>
          La conversación con IA se activa al conectar tu cuenta. La orientación
          de arriba usa el contexto de este proyecto.
        </p>
      )}
      {error && (
        <p className="tk-notice" role="alert">
          {error}
        </p>
      )}
    </DSCard>
  );
}
