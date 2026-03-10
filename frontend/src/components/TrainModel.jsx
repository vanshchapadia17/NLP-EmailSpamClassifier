import { useState } from "react";
import "./Classify.css";

export default function TrainModel({ onTrained }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const train = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/train", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      onTrained();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="section-title">Train Model</h2>
      <p className="subtitle">
        Trains multiple classifiers (Naive Bayes, Logistic Regression, SVM, Random Forest) on the
        SMS Spam dataset and saves the best one.
      </p>

      <button className="btn-primary" onClick={train} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? "Training… (this may take a minute)" : "🔄 Train Model"}
      </button>

      {error && <p className="error-msg">{error}</p>}

      {result && (
        <div className="train-result">
          <div className="train-summary">
            <span>Best model: <strong>{result.best_model}</strong></span>
            <span>F1 Score: <strong>{result.f1_score}</strong></span>
          </div>
          <h3 className="report-title">Classification Report</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Class</th>
                {Object.keys(Object.values(result.report)[0]).map((m) => (
                  <th key={m}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(result.report).map(([cls, metrics]) => (
                <tr key={cls}>
                  <td><strong>{cls}</strong></td>
                  {Object.values(metrics).map((v, i) => (
                    <td key={i}>{typeof v === "number" ? v.toFixed(4) : v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
