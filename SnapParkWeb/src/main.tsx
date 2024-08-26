import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RecoilRoot } from "recoil";

import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
};
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <RecoilRoot>
        <link
          rel="stylesheet"
          href="node_modules/react-github-contribution-calendar/default.css"
          type="text/css"
        />
        <App />
      </RecoilRoot>
    </PostHogProvider>
  </React.StrictMode>,
);
