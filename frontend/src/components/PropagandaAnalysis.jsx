import { useState } from "react";
import axios from "axios";

const PropagandaAnalysis = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [propagandaResult, setPropagandaResult] = useState(null);
  const [toxicityPercentage, setToxicityPercentage] = useState(0);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setShowResults(false);
    
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mock results for demonstration
      const mockResult = {
        isPropaganda: Math.random() > 0.5,
        confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
        toxicityPercentage: Math.floor(Math.random() * 100),
        reasoning: "This text contains elements commonly associated with propaganda techniques including emotional manipulation and biased language."
      };
      
      setPropagandaResult(mockResult);
      setToxicityPercentage(mockResult.toxicityPercentage);
      setShowResults(true);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAnalyze();
    }
  };

  const getToxicityColor = (percentage) => {
    if (percentage < 30) return "#16A34A"; // Green for low toxicity
    if (percentage < 70) return "#F59E0B"; // Yellow for medium toxicity
    return "#DC2626"; // Red for high toxicity
  };

  const getToxicityLevel = (percentage) => {
    if (percentage < 30) return "Low";
    if (percentage < 70) return "Medium";
    return "High";
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
        {/* Section 1: Input Area */}
        <div
          style={{
            backgroundColor: "#1F2937",
            borderRadius: "0.5rem",
            padding: "2rem",
            border: "1px solid #374151",
            marginBottom: "2rem",
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
            Propaganda & Hate Speech Detection
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <textarea
              placeholder="Enter text to analyze for propaganda and hate speech..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                width: "100%",
                height: "200px",
                backgroundColor: "#111827",
                border: "2px solid #DC2626",
                borderRadius: "0.375rem",
                padding: "1rem",
                color: "white",
                fontSize: "0.875rem",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#DC2626";
                e.target.style.boxShadow = "0 0 0 2px rgba(220, 38, 38, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#DC2626";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing}
            style={{
              backgroundColor: "#DC2626",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              padding: "0.75rem 2rem",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: !text.trim() || isAnalyzing ? "not-allowed" : "pointer",
              opacity: !text.trim() || isAnalyzing ? 0.6 : 1,
              transition: "all 0.2s ease",
              width: "120px",
            }}
            onMouseEnter={(e) => {
              if (text.trim() && !isAnalyzing) {
                e.target.style.backgroundColor = "#B91C1C";
              }
            }}
            onMouseLeave={(e) => {
              if (text.trim() && !isAnalyzing) {
                e.target.style.backgroundColor = "#DC2626";
              }
            }}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </button>

          <p
            style={{
              color: "#9CA3AF",
              fontSize: "0.75rem",
              marginTop: "1rem",
              lineHeight: 1.5,
            }}
          >
            Paste your text above and press Ctrl+Enter or click Analyze to detect propaganda and hate speech
          </p>
        </div>

        {/* Results Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Section 2: Propaganda Detection Result */}
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
              Propaganda Detection
            </h3>

            {showResults && propagandaResult && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: propagandaResult.isPropaganda ? "#DC2626" : "#16A34A",
                    marginBottom: "1rem",
                  }}
                >
                  {propagandaResult.isPropaganda ? "⚠" : "✅"}
                </div>
                
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: propagandaResult.isPropaganda ? "#DC2626" : "#16A34A",
                    marginBottom: "1rem",
                  }}
                >
                  {propagandaResult.isPropaganda ? "Propaganda Detected" : "No Propaganda"}
                </div>
                
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  Confidence: {propagandaResult.confidence}%
                </div>
                
                <div
                  style={{
                    backgroundColor: "#111827",
                    padding: "1rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #374151",
                  }}
                >
                  <p
                    style={{
                      color: "#D1D5DB",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {propagandaResult.reasoning}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Toxicity Percentage */}
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
              Toxicity Level
            </h3>

            {showResults && (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: getToxicityColor(toxicityPercentage),
                    marginBottom: "1rem",
                  }}
                >
                  {toxicityPercentage}%
                </div>
                
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: getToxicityColor(toxicityPercentage),
                    marginBottom: "2rem",
                  }}
                >
                  {getToxicityLevel(toxicityPercentage)} Toxicity
                </div>
                
                {/* Toxicity Bar */}
                <div
                  style={{
                    width: "100%",
                    height: "20px",
                    backgroundColor: "#374151",
                    borderRadius: "10px",
                    overflow: "hidden",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: '${toxicityPercentage}%',
                      height: "100%",
                      backgroundColor: getToxicityColor(toxicityPercentage),
                      borderRadius: "10px",
                      transition: "width 1s ease-out",
                    }}
                  />
                </div>
                
                <div
                  style={{
                    color: "#9CA3AF",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {toxicityPercentage < 30 && "This text shows minimal signs of hate speech or harmful content."}
                  {toxicityPercentage >= 30 && toxicityPercentage < 70 && "This text contains moderate levels of potentially harmful content."}
                  {toxicityPercentage >= 70 && "This text contains high levels of hate speech or harmful content."}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instruction Section */}
        <div
          style={{
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
            How Propaganda & Hate Speech Detection Works
          </h4>
          <p
            style={{
              color: "#D1D5DB",
              lineHeight: 1.6,
              fontSize: "0.875rem",
            }}
          >
            Our advanced AI analyzes text for propaganda techniques and hate speech patterns. The system identifies 
            emotional manipulation, biased language, inflammatory rhetoric, and discriminatory content. 
            <span style={{ color: "#16A34A", fontWeight: "600" }}> Green indicators</span> show safe content, 
            <span style={{ color: "#F59E0B", fontWeight: "600" }}> yellow</span> indicates moderate concerns, and 
            <span style={{ color: "#DC2626", fontWeight: "600" }}> red</span> flags high-risk content requiring attention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropagandaAnalysis;