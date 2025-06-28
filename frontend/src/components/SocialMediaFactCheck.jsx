import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import axios from "axios";

const SocialMediaFactCheck = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("Image size should be less than 50MB");
        return;
      }
      setSelectedImage(file);
      setError("");
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError("");
  };

  const handleFactCheck = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Step 1: Upload image to OCR endpoint (8060)
      const formData = new FormData();
      formData.append("image", selectedImage);

      const ocrRes = await axios.post("http://localhost:8060/extract-text/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extractedText = ocrRes.data.extracted_text;

      // Step 2: Send extracted text to fact-check endpoint (8000)
      const factRes = await axios.post("http://localhost:8000/factcheck", {
        text: extractedText,
      });

      const structuredResult = {
        credibility_score: factRes.data.credibility_score || 0,
        explanation: factRes.data.explanation || "No explanation available.",
        source: factRes.data.source || "",
        verdict: factRes.data.verdict || "Unknown",
        error: null,
      };

      setResult(structuredResult);
    } catch (err) {
      console.error("Fact-check process failed:", err);
      setResult({
        credibility_score: 0,
        explanation: "Something went wrong during fact-checking.",
        source: "",
        verdict: "Error",
        error: "Fact-check failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => navigate("/");

  const resultData = result && !result.error
    ? {
        summary: result.explanation,
        status: result.verdict,
        confidence: `${result.credibility_score}%`,
        source: result.source,
        falsePercentage:
          result.verdict === "False"
            ? result.credibility_score
            : result.verdict === "True"
            ? 100 - result.credibility_score
            : 50,
        truePercentage:
          result.verdict === "True"
            ? result.credibility_score
            : result.verdict === "False"
            ? 100 - result.credibility_score
            : 50,
      }
    : {
        summary: loading ? "Checking..." : result?.error || "No data available",
        status: loading ? "Checking..." : "Unknown",
        confidence: "...",
        source: "",
        falsePercentage: 0,
        truePercentage: 0,
      };

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const falseDash = (resultData.falsePercentage / 100) * circumference;
  const trueDash = (resultData.truePercentage / 100) * circumference;

  return (
    <div style={{ backgroundColor: "#111827", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        <h2 style={{ color: "white", fontSize: "1.5rem", marginBottom: "1rem", fontFamily: "serif" }}>
          Social Media Fact Check
        </h2>
        <p style={{ color: "#9CA3AF", marginBottom: "2rem" }}>
          Upload an image from social media to verify its authenticity and detect potential misinformation.
        </p>

        <button
          onClick={handleBackToHome}
          style={{
            backgroundColor: "transparent",
            color: "#9CA3AF",
            border: "1px solid #374151",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "2rem",
          }}
        >
          ← Back to Home
        </button>

        {!imagePreview ? (
          <div style={{
            border: "2px dashed #374151",
            borderRadius: "0.5rem",
            padding: "3rem",
            textAlign: "center",
            backgroundColor: "#1F2937",
          }}>
            <Upload size={48} style={{ color: "#9CA3AF", marginBottom: "1rem" }} />
            <h3 style={{ color: "white", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Upload Image
            </h3>
            <p style={{ color: "#9CA3AF", marginBottom: "1.5rem" }}>
              Drag and drop an image here, or click to browse
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label htmlFor="image-upload" style={{
              backgroundColor: "#16A34A",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.375rem",
              cursor: "pointer",
              display: "inline-block",
            }}>
              Choose Image
            </label>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img src={imagePreview} alt="Preview" style={{
                maxWidth: "100%",
                maxHeight: "400px",
                borderRadius: "0.5rem",
                border: "2px solid #374151",
              }} />
              <button onClick={removeImage} style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                backgroundColor: "#DC2626",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleFactCheck} disabled={loading} style={{
                backgroundColor: "#16A34A",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                padding: "0.75rem 2rem",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "0 auto",
              }}>
                {loading ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} />
                    Check Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: "#991B1B",
            color: "white",
            padding: "1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginTop: "2rem", textAlign: "center", color: "white" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #374151",
              borderTop: "4px solid #16A34A",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }} />
            Analyzing image for potential misinformation...
          </div>
        )}

        {!loading && result && (
          <div style={{ marginTop: "2rem", color: "white" }}>
            <h3>
              Verdict:{" "}
              <span style={{ color: resultData.status === "False" ? "#EF4444" : "#10B981" }}>
                {resultData.status}
              </span>
            </h3>
            <p><strong>Confidence:</strong> {resultData.confidence}</p>
            <p><strong>Explanation:</strong> {resultData.summary}</p>
            {resultData.source && (
              <p>
                <strong>Source: </strong>
                <a href={resultData.source} target="_blank" rel="noopener noreferrer" style={{ color: "#3B82F6" }}>
                  {resultData.source}
                </a>
              </p>
            )}
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

export default SocialMediaFactCheck;
