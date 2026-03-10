import { useState } from "react";
import "./Classify.css";

const EXAMPLES = [
  { label: "Spam 1", text: "WINNER!! You have been selected to receive a £900 prize reward! Call now to claim!" },
  { label: "Spam 2", text: "Free entry in 2 a wkly comp to win FA Cup final tkts. Text FA to 87121 now!" },
  { label: "Ham 1",  text: "Hey, are you coming to the meeting tomorrow at 3pm?" },
  { label: "Ham 2",  text: "I'll be home by 7. Can you pick up some milk on the way?" },
];

export default function SingleClassify({ modelReady }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const classify = async (msg) => {
    const target = msg ?? text;
    if (!target.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: target }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      if (msg) setText(msg);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Classify a Message</h2>
      <textarea
        rows={6}
        placeholder="Paste your email / SMS text here…"
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(null); }}
      />
      <button
        className="btn-primary"
        onClick={() => classify()}
        disabled={loading || !modelReady || !text.trim()}
        style={{ marginTop: 12 }}
      >
        {loading ? "Classifying…" : "Classify"}
      </button>

      {!modelReady && (
        <p className="warn">Model not trained yet. Go to the Train Model tab first.</p>
      )}

      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div className={`result-card ${result.label}`}>
          <span className="result-icon">{result.label === "spam" ? "🚨" : "✅"}</span>
          <div>
            <strong>{result.label === "spam" ? "SPAM" : "HAM (Not Spam)"}</strong>
            {result.confidence != null && (
              <span className="confidence"> — {(result.confidence * 100).toFixed(1)}% confidence</span>
            )}
          </div>
        </div>
      )}

      <div className="examples">
        <p className="examples-title">Try an example:</p>
        <div className="example-grid">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="btn-example" onClick={() => classify(ex.text)}>
              <span className="ex-label">{ex.label}</span>
              <span className="ex-text">{ex.text.slice(0, 55)}…</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
