import React, { useState } from "react";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export default function App() {
  const [topic, setTopic] = useState("Artificial Intelligence in Education");
  const [messages, setMessages] = useState([
    { role: "system", text: "👋 Welcome to AI Debate Coach! Enter your first argument to begin." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const prompt = `
You are an expert debate coach AI. The debate topic is: "${topic}".
The user's latest argument is: "${input}".

Respond in exactly this structure:

Counterargument: (2–4 sentences)
Score: (0–10)
Coaching Tip: (one sentence)
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
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const data = await res.json();
      console.log("Gemini Response:", data);

      let aiText =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "⚠️ AI could not generate a response.";

      aiText = aiText.replace(/\*\*/g, "").replace(/\n{3,}/g, "\n\n");

      setMessages([...newMessages, { role: "assistant", text: aiText }]);
    } catch (err) {
      console.error("API Error:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", text: "⚠️ Error contacting AI." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="app-container">

      <h1 className="title">🤖 AI Debate Coach</h1>

      <input
        className="topic-input"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${msg.role === "user" ? "user-msg" : "bot-msg"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <p className="thinking">🤔 AI is thinking...</p>}
      </div>

      <div className="input-row">
        <input
          className="text-input"
          placeholder="Enter your argument..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="send-button"
          disabled={loading}
        >
          Send
        </button>
      </div>

      {/* Footer Signature */}
      <footer className="footer-tag">
        © 2025 • Mustapha Jobe • AI Debate Coach
      </footer>

    </div>
  );
}
