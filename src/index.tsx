import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles.css";

// Initialize the React app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Root element not found");
    }

    const root = createRoot(container);
    root.render(<App />);

    console.log("Dropple React app initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize React app:", error);

    // Show error message to user
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff6b6b;
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      z-index: 1000;
    `;

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    errorDiv.innerHTML = `
      <h3>App Initialization Error</h3>
      <p>Failed to start the React app. Please refresh the page and try again.</p>
      <p><small>${errorMessage}</small></p>
    `;
    document.body.appendChild(errorDiv);
  }
});

// Export classes for potential external use
export { Game } from "./Game.js";
export * from "./types.js";
