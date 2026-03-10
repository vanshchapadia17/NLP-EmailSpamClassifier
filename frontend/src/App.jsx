import { useEffect, useState } from "react";
import SingleClassify from "./components/SingleClassify";
import BatchClassify from "./components/BatchClassify";
import TrainModel from "./components/TrainModel";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("single");
  const [modelReady, setModelReady] = useState(null);

  const checkStatus = () =>
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => setModelReady(d.model_ready))
      .catch(() => setModelReady(false));

  useEffect(() => { checkStatus(); }, []);

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-icon">📧</span>
        <div>
          <h1>Email Spam Classifier</h1>
          <p>Classify emails &amp; SMS messages as Spam or Ham using ML</p>
        </div>
        <div className={`status-badge ${modelReady ? "ready" : "not-ready"}`}>
          {modelReady === null ? "Checking…" : modelReady ? "Model Ready" : "Model Not Trained"}
        </div>
      </header>

      <div className="tab-bar">
        {["single", "batch", "train"].map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "single" ? "Single Message" : t === "batch" ? "Batch Classify" : "Train Model"}
          </button>
        ))}
      </div>

      <main className="app-main">
        {tab === "single" && <SingleClassify modelReady={modelReady} />}
        {tab === "batch"  && <BatchClassify  modelReady={modelReady} />}
        {tab === "train"  && <TrainModel onTrained={checkStatus} />}
      </main>
    </div>
  );
}
