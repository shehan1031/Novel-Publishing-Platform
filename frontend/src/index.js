import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NovelProvider } from "./context/NovelContext";
import { PointsProvider } from "./context/PointsContext";
import { ProgressProvider } from "./context/ProgressContext"; // ✅ added

import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <NovelProvider>
          <PointsProvider>
            <ProgressProvider> {/* Wrap ProgressProvider */}
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ProgressProvider>
          </PointsProvider>
        </NovelProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
