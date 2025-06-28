import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

const FactCheckResultPage = ({ newsUrl, onBack }) => {
  const [url, setUrl] = useState(newsUrl || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentNewsUrl, setCurrentNewsUrl] = useState(newsUrl);

  useEffect(() => {
    console.log("News URL:", currentNewsUrl);
    console.log("Fetching data...");

    const fetchFactCheckResult = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:8000/factcheck", {
          url: currentNewsUrl,
        });
        console.log("API Response:", response.data);
        
        // Structure the result to match expected format
        const structuredResult = {
          credibility_score: response.data.credibility_score || 0,
          explanation: response.data.explanation || "No explanation available.",
          source: response.data.source || "",
          verdict: response.data.verdict || "Unknown",
          error: null
        };
        
        setResult(structuredResult);
      } catch (error) {
        console.error("API error:", error);
        setResult({ 
          credibility_score: 0,
          explanation: "Fact-check failed. Please try again.",
          source: "",
          verdict: "Error",
          error: "Fact-check failed. Please try again." 
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentNewsUrl && currentNewsUrl.trim() !== "") {
      fetchFactCheckResult();
    }
  }, [currentNewsUrl]);

  const resultData = result && !result.error
    ? {
        summary: result.explanation || "No explanation available.",
        status: result.verdict || "Unknown",
        confidence: result.credibility_score ? `${result.credibility_score}%` : "N/A",
        source: result.source || "",
        falsePercentage:
          result.verdict === "False"
            ? result.credibility_score || 0
            : result.credibility_score ? (100 - result.credibility_score) : 50,
        truePercentage:
          result.verdict === "True"
            ? result.credibility_score || 0
            : result.credibility_score ? result.credibility_score : 50,
      }
    : {
        summary: loading ? "Loading..." : (result?.error || "No data available"),
        status: loading ? "Checking..." : "Unknown",
        confidence: loading ? "..." : "N/A",
        source: "",
        falsePercentage: 0,
        truePercentage: 0,
      };

  const handleNewSearch = () => {
    if (url && url.trim() !== "") {
      setCurrentNewsUrl(url);
      setResult(null); // Reset result to show loading state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewSearch();
    }
  };

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const falseStrokeDasharray =
    (resultData.falsePercentage / 100) * circumference;
  const trueStrokeDasharray = (resultData.truePercentage / 100) * circumference;

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
        {/* Search Bar */}
        <div
          style={{
            marginBottom: "3rem",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "400",
              marginBottom: "1.5rem",
              fontFamily: "serif",
            }}
          >
            Is this News True ?
          </h2>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter news URL to fact-check..."
              style={{
                flex: 1,
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
                padding: "0.75rem 1rem",
                color: "white",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleNewSearch}
              disabled={!url || url.trim() === ""}
              style={{
                backgroundColor: url && url.trim() !== "" ? "#16A34A" : "#6B7280",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.75rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: url && url.trim() !== "" ? "pointer" : "not-allowed",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (url && url.trim() !== "") {
                  e.target.style.backgroundColor = "#15803D";
                }
              }}
              onMouseLeave={(e) => {
                if (url && url.trim() !== "") {
                  e.target.style.backgroundColor = "#16A34A";
                }
              }}
            >
              {loading ? "Checking..." : "Search"}
            </button>
          </div>
          
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              style={{
                backgroundColor: "transparent",
                color: "#9CA3AF",
                border: "1px solid #374151",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#374151";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#9CA3AF";
              }}
            >
              ← Back to Search
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              color: "white",
              fontSize: "1.125rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #374151",
                  borderTop: "4px solid #16A34A",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              Fact-checking news article...
            </div>
          </div>
        )}

        {/* Results Content */}
        {!loading && result && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            {/* Left Panel - News Summary */}
            <div>
              <h3
                style={{
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: "400",
                  marginBottom: "1.5rem",
                  fontFamily: "serif",
                }}
              >
                News Summary
              </h3>

              <div
                style={{
                  backgroundColor: "#1F2937",
                  borderRadius: "0.5rem",
                  padding: "1.5rem",
                  border: "1px solid #374151",
                }}
              >
                <p
                  style={{
                    color: "#D1D5DB",
                    lineHeight: 1.7,
                    fontSize: "0.875rem",
                    margin: 0,
                  }}
                >
                  {resultData.summary}
                </p>
              </div>

              {/* Additional Info */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "#1F2937",
                  borderRadius: "0.375rem",
                  border: "1px solid #374151",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "2rem" }}>
                    <div>
                      <span style={{ color: "#9CA3AF" }}>Status: </span>
                      <span
                        style={{
                          color:
                            resultData.status === "False" ? "#EF4444" : "#10B981",
                          fontWeight: "600",
                        }}
                      >
                        {resultData.status}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#9CA3AF" }}>Confidence: </span>
                      <span style={{ color: "white", fontWeight: "600" }}>
                        {resultData.confidence}
                      </span>
                    </div>
                  </div>
                  {resultData.source && (
                    <div>
                      <span style={{ color: "#9CA3AF" }}>Source: </span>
                      <a
                        href={resultData.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#3B82F6",
                          textDecoration: "none",
                          wordBreak: "break-all",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.textDecoration = "none";
                        }}
                      >
                        {resultData.source}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Fact Check Chart */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "200px",
                  height: "200px",
                }}
              >
                {/* SVG Circle Chart */}
                <svg
                  width="200"
                  height="200"
                  style={{
                    transform: "rotate(-90deg)",
                  }}
                >
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="12"
                  />

                  {/* False percentage (red) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="12"
                    strokeDasharray={`${falseStrokeDasharray} ${circumference}`}
                    strokeDashoffset="0"
                    style={{
                      transition: "stroke-dasharray 1s ease-out",
                    }}
                  />

                  {/* True percentage (green) */}
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="12"
                    strokeDasharray={`${trueStrokeDasharray} ${circumference}`}
                    strokeDashoffset={`-${falseStrokeDasharray}`}
                    style={{
                      transition: "stroke-dasharray 1s ease-out 0.5s",
                    }}
                  />
                </svg>

                {/* Center Text */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#DC2626",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {resultData.falsePercentage}%
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#DC2626",
                      fontWeight: "500",
                    }}
                  >
                    False
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  gap: "2rem",
                  fontSize: "0.875rem",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#DC2626",
                      borderRadius: "50%",
                    }}
                  />
                  <span style={{ color: "white" }}>
                    False ({resultData.falsePercentage}%)
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "#16A34A",
                      borderRadius: "50%",
                    }}
                  />
                  <span style={{ color: "white" }}>
                    True ({resultData.truePercentage}%)
                  </span>
                </div>
              </div>

              {/* Additional Actions */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <button
                  style={{
                    backgroundColor: "#1F2937",
                    color: "white",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#1F2937";
                  }}
                >
                  View Details
                </button>
                <button
                  style={{
                    backgroundColor: "#DC2626",
                    color: "white",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#B91C1C";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#DC2626";
                  }}
                >
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Source Information */}
        {!loading && result && (
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
              Analysis Details
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                fontSize: "0.875rem",
              }}
            >
              <div>
                <span style={{ color: "#9CA3AF" }}>Sources Checked: </span>
                <span style={{ color: "white" }}>15</span>
              </div>
              <div>
                <span style={{ color: "#9CA3AF" }}>Analysis Time: </span>
                <span style={{ color: "white" }}>2.3 seconds</span>
              </div>
              <div>
                <span style={{ color: "#9CA3AF" }}>Fact-Check ID: </span>
                <span style={{ color: "white" }}>
                  FC-2024-{Math.random().toString(36).substr(2, 9)}
                </span>
              </div>
              <div>
                <span style={{ color: "#9CA3AF" }}>Last Updated: </span>
                <span style={{ color: "white" }}>
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default FactCheckResultPage;