import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPerformanceMonitoring } from "./lib/perf";

initPerformanceMonitoring();
createRoot(document.getElementById("root")!).render(<App />);
