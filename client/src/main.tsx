import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "@fontsource-variable/inter";
import "./styles/index.css";
import App from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Pages are pre-rendered to HTML at build time: attach to that HTML instead of drawing the page again.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
