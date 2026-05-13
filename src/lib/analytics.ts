export function trackEvent(category: string, action: string, label?: string) {
  if (typeof window === "undefined") return;
  const paq = (window as any)._paq;
  if (paq) {
    paq.push(["trackEvent", category, action, label || undefined]);
  }
}
