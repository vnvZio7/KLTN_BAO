import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/userContext.jsx";
import { Toaster } from "react-hot-toast";
import { ApiProvider } from "./providers/Api.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ApiProvider>
        <UserProvider>
          <App />
          <Toaster position="top-right" reverseOrder={false} />
        </UserProvider>
      </ApiProvider>
    </BrowserRouter>
  </StrictMode>
);
