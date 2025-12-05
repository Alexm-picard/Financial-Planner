import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuth0 } from "./lib/auth0";

// Initialize Auth0 when app starts
initAuth0()
  .then(() => {
    console.log('✅ Auth0 initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to initialize Auth0:', error);
  });

createRoot(document.getElementById("root")!).render(<App />);
