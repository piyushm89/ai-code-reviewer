import { useState, useEffect } from 'react';
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from "axios";
import "./App.css";

// Base URL of the backend. Comes from VITE_API_URL (.env.development locally,
// Vercel dashboard in production). Falls back to localhost so dev works even
// if the env file is missing. Strip any trailing slash to avoid `//ai/...`.
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

function App() {
  const [code, setCode] = useState(`function sum() {
  return 1 + 1;
}`);

  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    if (loading) return;
    if (!code.trim()) {
      setReview("Please enter some code to review.");
      return;
    }

    setLoading(true);
    setReview("Reviewing your code…");

    try {
      const response = await axios.post(
        `${API_URL}/ai/get-review`,
        { code }
      );

      setReview(response.data);
    } catch (error) {
      console.error("Review Error:", error);

      if (error.response) {
        // Backend returns plain text or { error: "..." }. Normalise both.
        const data = error.response.data;
        const message =
          typeof data === "string" ? data : data?.error || JSON.stringify(data);
        setReview(`Error (${error.response.status}): ${message}`);
      } else {
        setReview(
          `Failed to connect to backend at ${API_URL}. Is the server running?`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <div className="logo">🤖</div>
            <div className="brand-text">
              <div className="title">AI Code Reviewer</div>
              <div className="subtitle">Powered by Mistral AI</div>
            </div>
          </div>
          <div className="actions">
            <button className="small-cta" onClick={reviewCode} disabled={loading}>
              {loading ? "Reviewing…" : "Review"}
            </button>
          </div>
        </div>
      </header>

      <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={(code) => setCode(code)}
            highlight={(code) =>
              prism.highlight(
                code,
                prism.languages.javascript,
                "javascript"
              )
            }
            padding={10}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 15,
              minHeight: "100%",
              width: "100%",
            }}
          />
        </div>

        <div
          onClick={reviewCode}
          className="review"
          style={loading ? { opacity: 0.6, pointerEvents: "none" } : undefined}
        >
          {loading ? "Reviewing…" : "Review"}
        </div>
      </div>

      <div className="right">
        {review ? (
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review}
          </Markdown>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🪄</div>
            <h2>No review yet</h2>
            <p>
              Write or paste some code on the left, then hit{" "}
              <strong>Review</strong> to get instant AI feedback.
            </p>
          </div>
        )}
      </div>
      </main>
    </>
  );
}

export default App;