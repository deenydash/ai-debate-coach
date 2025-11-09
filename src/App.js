import React, { useEffect, useMemo, useRef, useState } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

function speak(text, enabled) {
  if (!enabled) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {}
}

export default function App() {
  const [topic, setTopic] = useState("Artificial Intelligence in Education");
  const [mode, setMode] = useState("Coach");
  const [messages, setMessages] = useState([
    { role: "system", text: "👋 Welcome to AI Debate Coach! Enter your first argument to begin." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);

  const scrollRef = useRef(null);

  const avgScore = useMemo(() => {
    const nums = messages
      .map((m) => {
        const match = /(?:Score|score)\s*[:-]\s*(\d+(?:\.\d+)?)/i.exec(m.text);

        return match ? Number(match[1]) : null;
      })
      .filter((n) => typeof n === "number");
    if (!nums.length) return 0;
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input.trim() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);

    const systemInstruction =
      mode === "Coach"
        ? `You are an expert debate coach. Provide a counterargument, score (0-10), and coaching tip.`
        : mode === "Opponent"
        ? `You are the user's debate opponent. Respond with a rebuttal and strategic critique.`
        : `You are a neutral judge. Provide balanced analysis and constructive critique.`;

    const formatRule = `Format strictly:
Counterargument: <2-4 sentences>
Score: <0-10>
Coaching Tip: <one sentence>`;

    const history = nextMsgs
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `
Debate Topic: "${topic}"
Mode: ${mode}

${systemInstruction}
${formatRule}

Conversation:
${history}

Newest Argument: "${userMsg.text}"
`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();
      const raw =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "⚠️ AI could not generate a response.";

      const cleaned = raw.replace(/\*\*/g, "").trim();
      speak(cleaned, voiceOn);

      setMessages([...nextMsgs, { role: "assistant", text: cleaned }]);
    } catch {
      setMessages([...nextMsgs, { role: "assistant", text: "⚠️ AI error occurred." }]);
    }

    setLoading(false);
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">🧠 Debate Info</div>

        <label className="label">Topic</label>
        <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} />

        <label className="label">Mode</label>
        <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option>Coach</option>
          <option>Opponent</option>
          <option>Judge</option>
        </select>

        <label className="label">Average Score</label>
        <div className="scoreBox">{avgScore.toFixed(1)}</div>
      </aside>

      <main className="main">
        <h1 className="title">🤖 AI Debate Coach</h1>

        <div className="board">
          {messages.length === 1 && (
            <div className="pill">👋 Welcome to AI Debate Coach! Enter your first argument to begin.</div>
          )}

          <div className="chat" ref={scrollRef}>
            {messages
              .filter((m) => m.role !== "system")
              .map((m, i) => (
                <div key={i} className={`bubble ${m.role === "user" ? "me" : "ai"}`}>
                  {m.text}
                </div>
              ))}

            {loading && <div className="thinking">🤔 AI is thinking…</div>}
          </div>
        </div>

        <div className="composer">
          <div className={`voice ${voiceOn ? "on" : "off"}`} onClick={() => setVoiceOn((v) => !v)}>
            🔊 Voice: {voiceOn ? "ON" : "OFF"}
          </div>

          <input
            className="composerInput"
            placeholder="Enter your argument..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send" onClick={sendMessage} disabled={loading}>
            Send
          </button>
        </div>

        <footer className="footer-tag">© 2025 • Mustapha Jobe • AI Debate Coach</footer>
      </main>
    </div>
  );
}
