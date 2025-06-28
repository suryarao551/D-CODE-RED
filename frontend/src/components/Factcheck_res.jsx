import { useState } from "react";
import axios from "axios";

const FactCheckResultPage = ({ newsUrl, newsText }) => {
  // Optional: keep toggle for user to see which input type they want to enter
  const [mode, setMode] = useState(newsUrl ? "url" : "text");
  const [input, setInput] = useState(newsUrl || newsText || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFactCheckResult = async (value) => {
    if (!value) return;
    setLoading(true);

    try {
      const isProbablyURL = value.startsWith("http://") || value.startsWith("https://");
      const payload = isProbablyURL
        ? { url: value }
        : { text: value };

      console.log("Sending payload:", payload);

      const response = await axios.post("http://localhost:8000/factcheck", payload);

      const structuredResult = {
        credibility_score: response.data.credibility_score || 0,
        explanation: response.data.explanation || "No explanation available.",
        source: response.data.source || "",
        verdict: response.data.verdict || "Unknown",
        error: null,
      };

      setResult(structuredResult);
    } catch (error) {
      console.error("Fact-check failed:", error);
      setResult({
        credibility_score: 0,
        explanation: "Fact-check failed. Please try again.",
        source: "",
        verdict: "Error",
        error: "Fact-check failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!input.trim()) return;
    setResult(null);
    fetchFactCheckResult(input.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ backgroundColor: "#111827", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "1rem", fontFamily: "serif" }}>
          Is this News True?
        </h2>

        {/* Toggle buttons (for UX only) */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button
            onClick={() => setMode("url")}
            style={{
              backgroundColor: mode === "url" ? "#16A34A" : "#1F2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            URL
          </button>
          <button
            onClick={() => setMode("text")}
            style={{
              backgroundColor: mode === "text" ? "#16A34A" : "#1F2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: "0.375rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Text
          </button>
        </div>

        {/* Show input based on selected mode (optional) */}
        {mode === "url" ? (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter news URL..."
            style={{
              width: "100%",
              backgroundColor: "#1F2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
            }}
          />
        ) : (
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste the news content..."
            rows={5}
            style={{
              width: "100%",
              backgroundColor: "#1F2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              resize: "vertical",
            }}
          />
        )}

        <button
          onClick={handleSearch}
          disabled={!input.trim()}
          style={{
            backgroundColor: input.trim() ? "#16A34A" : "#6B7280",
            color: "white",
            borderRadius: "0.375rem",
            border: "none",
            padding: "0.75rem 2rem",
            cursor: input.trim() ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Checking..." : "Check"}
        </button>

        {/* Render results as you did before */}
        { /* ... your result rendering code here ... */ }
      </div>
    </div>
  );
};

export default FactCheckResultPage;
