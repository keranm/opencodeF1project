"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL?.replace(/\/+$/, "");
const SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

export default function Matomo() {
  const pathname = usePathname();

  useEffect(() => {
    if (!MATOMO_URL || !SITE_ID) return;
    if (typeof window === "undefined") return;
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return;
    if ((window as any)._paq) return;

    (window as any)._paq = (window as any)._paq || [];
    const paq = (window as any)._paq;
    paq.push(["trackPageView"]);
    paq.push(["enableLinkTracking"]);
    paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`]);
    paq.push(["setSiteId", SITE_ID]);

    const script = document.createElement("script");
    script.async = true;
    script.src = `${MATOMO_URL}/matomo.js`;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const paq = (window as any)._paq;
    if (paq) {
      paq.push(["setCustomUrl", window.location.href]);
      paq.push(["trackPageView"]);
    }
  }, [pathname]);

  return null;
}
