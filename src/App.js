import React, { useState } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export default function App() {
  const [topic, setTopic] = useState("Artificial Intelligence in Education");
  const [mode, setMode] = useState("Coach");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Welcome to AI Debate Coach! Enter your first argument to begin." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Calculate average score from messages
  const scores = messages
    .map(m => parseFloat(m.text.match(/Score:\s*([0-9.]+)/)?.[1]))
    .filter(n => !isNaN(n));
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  function speak(text) {
    if (!voiceEnabled) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    speechSynthesis.speak(utter);
  }

  async function sendMessage() {
    if (!input.trim()) return;

    const newMsg = { role: "user", text: input };
    setMessages((m) => [...m, newMsg]);
    setInput("");
    setLoading(true);

    const prompt = `
Debate Mode: ${mode}
Topic: ${topic}
User Argument: ${input}

Respond using:
Counterargument: (2-4 sentences)
Score: (0-10)
Coaching Tip: (one sentence)
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
      let aiText =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "⚠️ AI could not generate a response.";

      aiText = aiText.replace(/\*\*/g, "");
      setMessages((m) => [...m, { role: "assistant", text: aiText }]);
      speak(aiText);

    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", text: "⚠️ Error contacting AI." }]);
    }

    setLoading(false);

    setTimeout(() => {
      const box = document.getElementById("chatBox");
      if (box) box.scrollTop = box.scrollHeight;
    }, 100);
  }

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <div className="sidebar">
        <h2>🧠 Debate Info</h2>

        <label className="sidebar-label">Topic</label>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} />

        <label className="sidebar-label">Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option>Coach</option>
          <option>Opponent</option>
          <option>Judge</option>
        </select>

        <label className="sidebar-label">Average Score</label>
        <div className="score-display">{avgScore.toFixed(1)}</div>
      </div>

      {/* Chat */}
      <div className="chat-section">
        <h1 className="title">🤖 AI Debate Coach</h1>

        <div className="chat-box" id="chatBox">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role === "user" ? "user-msg" : "bot-msg"}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="msg bot-msg thinking">AI is thinking…</div>}
        </div>

        <div className="voice-toggle" onClick={() => setVoiceEnabled(!voiceEnabled)}>
          🔊 Voice: {voiceEnabled ? "ON" : "OFF"}
        </div>

        <div className="input-row">
          <input
            className="text-input"
            placeholder="Enter your argument..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="send-button" onClick={sendMessage}>Send</button>
        </div>
      </div>

    </div>
  );
}
