import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./presentation/App";
import "./design-system/colors.css";
import "./presentation/index.css";
import "./presentation/styles/theme.css";
import "./presentation/styles/layout.css";
import "./presentation/styles/components.css";
import "./presentation/styles/lobbyControls.css";
import "./presentation/styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
