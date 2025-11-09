import React, { useEffect, useMemo, useRef, useState } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

function speak(text, enabled) {
  if (!enabled) return;
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function App() {
  const [topic, setTopic] = useState("Artificial Intelligence in Education");
  const [mode, setMode] = useState("Coach");
  const [voiceOn, setVoiceOn] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Welcome to AI Debate Coach! Enter your first argument to begin."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const avgScore = useMemo(() => {
    const scores = messages
      .map(m => {
        const match = /Score:\s*(\d+)/i.exec(m.text);
        return match ? Number(match[1]) : null;
      })
      .filter(v => v !== null);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "0.0";
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const modeInstruction =
      mode === "Coach"
        ? "You are a debate coach. Provide guidance and refinement."
        : mode === "Opponent"
        ? "You are debating against the user. Refute strongly."
        : "You are a judge. Evaluate neutrally and explain your scoring.";

    const prompt = `
Debate Topic: ${topic}
Mode: ${mode}
${modeInstruction}

Respond EXACTLY in this format:

Counterargument: (2–4 sentences)
Score: (0-10)
Coaching Tip: (1 short sentence)
`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      newMessages.map(m => `${m.role}: ${m.text}`).join("\n") +
                      "\n\n" +
                      prompt
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await res.json();
      let reply = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? "⚠️ No response.";
      reply = reply.replace(/\*\*/g, "").trim();

      speak(reply, voiceOn);
      setMessages([...newMessages, { role: "assistant", text: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", text: "⚠️ API Error — Try again." }]);
    }

    setLoading(false);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🧠 Debate Info</h2>

        <label>Topic</label>
        <input value={topic} onChange={e => setTopic(e.target.value)} />

        <label>Mode</label>
        <select value={mode} onChange={e => setMode(e.target.value)}>
          <option>Coach</option>
          <option>Opponent</option>
          <option>Judge</option>
        </select>

        <label>Average Score</label>
        <div className="score">{avgScore}</div>
      </aside>

      <main className="main">
        <h1>🤖 AI Debate Coach</h1>

        <div className="chat" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "bubble user" : "bubble ai"}>
              {msg.text}
            </div>
          ))}

          {loading && <div className="thinking">🤔 AI is thinking...</div>}
        </div>

        <div className="controls">
          <button className="voice-btn" onClick={() => setVoiceOn(v => !v)}>
            🔊 Voice: {voiceOn ? "ON" : "OFF"}
          </button>

          <input
            className="input"
            placeholder="Enter your argument..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />

          <button className="send" onClick={sendMessage}>
            Send
          </button>
        </div>

        <footer className="footer">© 2025 • Mustapha Jobe • AI Debate Coach</footer>
      </main>
    </div>
  );
}
