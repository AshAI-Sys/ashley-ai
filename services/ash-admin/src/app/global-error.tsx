"use client";

import { useEffect } from "react";

// Global error boundary - handles unrecoverable errors
// Note: This MUST include html/body per Next.js App Router requirements
// Build warnings about static generation can be ignored - page works at runtime
export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom right, #fef2f2, #fed7aa)",
          }}
        >
          <div style={{ padding: "1rem", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "6rem",
                fontWeight: "bold",
                color: "#dc2626",
                margin: "0",
              }}
            >
              Error
            </h1>
            <h2
              style={{
                marginTop: "1rem",
                fontSize: "1.875rem",
                fontWeight: 600,
                color: "#1f2937",
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                marginBottom: "2rem",
                marginTop: "0.5rem",
                color: "#4b5563",
              }}
            >
              An unexpected error occurred. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-block",
                borderRadius: "0.5rem",
                background: "#dc2626",
                padding: "0.75rem 1.5rem",
                fontWeight: 500,
                color: "white",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={e => (e.currentTarget.style.background = "#b91c1c")}
              onMouseOut={e => (e.currentTarget.style.background = "#dc2626")}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
