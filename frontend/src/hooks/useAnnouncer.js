import { useEffect, useRef, useCallback } from "react";

export default function useAnnouncer() {
  const regionRef = useRef(null);

  useEffect(() => {
    // reuse existing announcer if already mounted by another instance
    let el = document.getElementById("navella-announcer");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("aria-live", "polite");
      el.setAttribute("aria-atomic", "true");
      el.setAttribute("role", "status");
      el.id = "navella-announcer";
      el.style.cssText =
        "position:absolute;width:1px;height:1px;padding:0;margin:-1px;" +
        "overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";
      document.body.appendChild(el);
    }
    regionRef.current = el;
    return () => {
      // only remove if we created it (no other consumers)
      if (regionRef.current && !regionRef.current._kept) {
        regionRef.current.remove();
      }
    };
  }, []);

  const announce = useCallback((message, priority = "polite") => {
    if (!regionRef.current) return;
    regionRef.current.setAttribute("aria-live", priority);
    regionRef.current.textContent = "";
    requestAnimationFrame(() => {
      if (regionRef.current) regionRef.current.textContent = message;
    });
  }, []);

  return announce;
}