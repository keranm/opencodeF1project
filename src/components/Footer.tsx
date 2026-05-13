"use client";

import { useEffect, useState } from "react";

export default function Footer({
  generatedAt,
  revalidateInterval = 21600,
}: {
  generatedAt?: string;
  revalidateInterval?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!generatedAt) return null;

  const updated = new Date(generatedAt);
  const nextUpdate = new Date(updated.getTime() + revalidateInterval * 1000);
  const minsUntilNext = Math.max(0, Math.floor((nextUpdate.getTime() - now.getTime()) / 60000));

  return (
    <footer className="border-t border-gray-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">PIT LANE</span>
            <span className="text-xs text-gray-400">F1 News Dashboard</span>
          </div>
          <p className="text-sm text-gray-400">
            This site aggregates publicly available RSS feeds from F1 news sources.
            All content belongs to their respective owners.
          </p>
        </div>
        {mounted && (
          <p className="text-xs text-gray-400 text-center sm:text-left mt-4">
            News last updated:{" "}
            {new Intl.DateTimeFormat(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            }).format(updated)}
            {" · "}
            Next update in{" "}
            {minsUntilNext < 1
              ? "less than a minute"
              : `${minsUntilNext} min${minsUntilNext === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </footer>
  );
}
