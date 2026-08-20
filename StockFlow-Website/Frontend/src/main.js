import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

