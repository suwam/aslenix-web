import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

const scheduleIdle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 1800));
scheduleIdle(() => {
  import("./lib/perf").then(({ initPerformanceMonitoring }) => initPerformanceMonitoring());
});
