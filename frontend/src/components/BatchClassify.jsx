import { useState } from "react";
import "./Classify.css";

export default function BatchClassify({ modelReady }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const classify = async () => {
    const messages = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!messages.length) return;
    setLoading(true);
    setResults(null);
    setError("");
    try {
      const res = await fetch("/api/predict-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Batch Classify</h2>
      <p className="subtitle">Enter one message per line:</p>
      <textarea
        rows={8}
        placeholder={"Message 1\nMessage 2\nMessage 3"}
        value={text}
        onChange={(e) => { setText(e.target.value); setResults(null); }}
      />
      <button
        className="btn-primary"
        onClick={classify}
        disabled={loading || !modelReady || !text.trim()}
        style={{ marginTop: 12 }}
      >
        {loading ? "Classifying…" : "Classify All"}
      </button>

      {!modelReady && (
        <p className="warn">Model not trained yet. Go to the Train Model tab first.</p>
      )}
      {error && <p className="error-msg">{error}</p>}

      {results && (
        <>
          <div className="summary-bar">
            <span>Total: <b>{results.summary.total}</b></span>
            <span className="spam-count">🚨 Spam: <b>{results.summary.spam}</b></span>
            <span className="ham-count">✅ Ham: <b>{results.summary.ham}</b></span>
          </div>
          <table className="results-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Message</th>
                <th>Label</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((r, i) => (
                <tr key={i} className={r.label}>
                  <td>{i + 1}</td>
                  <td className="msg-cell">{r.message}</td>
                  <td>
                    <span className={`badge ${r.label}`}>
                      {r.label === "spam" ? "🚨 Spam" : "✅ Ham"}
                    </span>
                  </td>
                  <td>{r.confidence != null ? `${(r.confidence * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
