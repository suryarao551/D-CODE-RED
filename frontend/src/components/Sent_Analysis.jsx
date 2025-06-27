import { useState } from "react";
import axios from "axios";

const SentimentAnalysisPage = () => {
  const [newsText, setNewsText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [audioFile, setAudioFile] = useState(null);

  const sentimentData = [
    { name: "Sadnesss", value: 25, color: "#DC2626" },
    { name: "Joy", value: 30, color: "#DC2626" },
    { name: "Love", value: 60, color: "#16A34A" },
    { name: "Anger", value: 45, color: "#DC2626" },
    { name: "Fear", value: 35, color: "#DC2626" },
    { name: "Surprise", value: 20, color: "#DC2626" },
  ];

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
  };

  const handleAnalyze = async () => {
    if (!newsText.trim() && !audioFile) return;
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAnalyze();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111827",
        padding: "2rem 0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3rem",
            alignItems: "start",
          }}
        >
          {/* Left Panel - Audio Upload and Text Input */}
          <div
            style={{
              backgroundColor: "#1F2937",
              borderRadius: "0.5rem",
              padding: "2rem",
              border: "1px solid #374151",
            }}
          >
            <h2
              style={{
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "400",
                marginBottom: "2rem",
                fontFamily: "serif",
              }}
            >
              Know the sentiment of this News
            </h2>

            {/* Audio Upload Box */}
            <div
              style={{
                position: "relative",
                border: "2px dashed #16A34A",
                borderRadius: "0.5rem",
                padding: "1.5rem 1rem",
                marginBottom: "1.5rem",
                background: "#111827",
                textAlign: "center",
              }}
            >
              <label
                style={{ color: "#16A34A", fontWeight: 500, cursor: "pointer" }}
              >
                Click to upload audio file
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  style={{ display: "none" }}
                />
              </label>
              {audioFile && (
                <>
                  <div style={{ color: "#9CA3AF", marginTop: 8 }}>
                    Selected: {audioFile.name}
                  </div>
                  <button
                    onClick={handleRemoveAudio}
                    aria-label="Remove audio file"
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#DC2626",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      lineHeight: "20px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <textarea
                placeholder="Insert news paragraph"
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#111827",
                  border: "2px solid #16A34A",
                  borderRadius: "0.375rem",
                  padding: "1rem",
                  color: "white",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#16A34A";
                  e.target.style.boxShadow = "0 0 0 2px rgba(22, 163, 74, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#16A34A";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={(!newsText.trim() && !audioFile) || isAnalyzing}
              style={{
                backgroundColor: "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.75rem 2rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor:
                  (!newsText.trim() && !audioFile) || isAnalyzing
                    ? "not-allowed"
                    : "pointer",
                opacity: (!newsText.trim() && !audioFile) || isAnalyzing ? 0.6 : 1,
                transition: "all 0.2s ease",
                width: "120px",
              }}
              onMouseEnter={(e) => {
                if ((newsText.trim() || audioFile) && !isAnalyzing) {
                  e.target.style.backgroundColor = "#15803D";
                }
              }}
              onMouseLeave={(e) => {
                if ((newsText.trim() || audioFile) && !isAnalyzing) {
                  e.target.style.backgroundColor = "#16A34A";
                }
              }}
            >
              {isAnalyzing ? "Analyzing..." : "Search"}
            </button>

            <p
              style={{
                color: "#9CA3AF",
                fontSize: "0.75rem",
                marginTop: "1rem",
                lineHeight: 1.5,
              }}
            >
              Paste your news content above or upload an audio file and press
              Ctrl+Enter or click Search to analyze sentiment
            </p>
          </div>

          {/* Right Panel - Sentiment Results */}
          <div
            style={{
              backgroundColor: "#1F2937",
              borderRadius: "0.5rem",
              padding: "2rem",
              border: "1px solid #374151",
              opacity: showResults ? 1 : 0.5,
              transition: "opacity 0.3s ease",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "1.5rem",
                fontWeight: "400",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              Sentiment
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sentimentData.map((sentiment, index) => (
                <div
                  key={sentiment.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    animation: showResults
                      ? `slideInRight 0.5s ease-out ${index * 0.1}s both`
                      : "none",
                  }}
                >
                  {/* Sentiment Label */}
                  <div
                    style={{
                      color: "white",
                      fontSize: "0.875rem",
                      fontWeight: "400",
                      minWidth: "80px",
                      textAlign: "left",
                    }}
                  >
                    {sentiment.name}
                  </div>
                  {/* Sentiment Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: "16px",
                      background: "#374151",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${sentiment.value}%`,
                        height: "100%",
                        background: sentiment.color,
                        borderRadius: "8px 0 0 8px",
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                  {/* Sentiment Value */}
                  <div
                    style={{
                      color: sentiment.color,
                      fontWeight: "600",
                      minWidth: "40px",
                      textAlign: "right",
                    }}
                  >
                    {sentiment.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Instruction Section */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            backgroundColor: "#1F2937",
            borderRadius: "0.5rem",
            border: "1px solid #374151",
          }}
        >
          <h4
            style={{
              color: "white",
              fontSize: "1.125rem",
              fontWeight: "600",
              marginBottom: "1rem",
            }}
          >
            How Sentiment Analysis Works
          </h4>
          <p
            style={{
              color: "#D1D5DB",
              lineHeight: 1.6,
              fontSize: "0.875rem",
            }}
          >
            Our advanced AI analyzes the emotional tone and sentiment within news
            articles. The system identifies various emotions including hate,
            violence, joy, fear, and more. Positive sentiments are shown in{" "}
            <span style={{ color: "#16A34A", fontWeight: "600" }}>green</span>,
            while negative sentiments appear in{" "}
            <span style={{ color: "#DC2626", fontWeight: "600" }}>red</span>. This
            helps you understand the emotional impact and bias present in news
            content.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SentimentAnalysisPage;
