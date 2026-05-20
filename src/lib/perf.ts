import { supabase } from "@/integrations/supabase/client";

export const initPerformanceMonitoring = () => {
  if (typeof window === "undefined") return;

  // Capture page load time
  window.addEventListener("load", () => {
    setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.loadEventEnd > 0) {
        const loadTime = Math.round(nav.loadEventEnd - nav.startTime);
        // Only log slow pages (> 3s) to avoid noise
        if (loadTime > 3000) {
          supabase.from("error_logs").insert({
            page_path: window.location.pathname,
            message: `Slow page load: ${loadTime}ms`,
            severity: "warning",
            user_agent: navigator.userAgent,
            load_time_ms: loadTime,
          });
        }
      }
    }, 0);
  });

  // Capture runtime errors
  window.addEventListener("error", (e) => {
    supabase.from("error_logs").insert({
      page_path: window.location.pathname,
      message: e.message?.slice(0, 500) ?? "Unknown error",
      stack: e.error?.stack?.slice(0, 2000),
      severity: "error",
      user_agent: navigator.userAgent,
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (e) => {
    supabase.from("error_logs").insert({
      page_path: window.location.pathname,
      message: `Unhandled rejection: ${String(e.reason)?.slice(0, 500)}`,
      severity: "error",
      user_agent: navigator.userAgent,
    });
  });
};
