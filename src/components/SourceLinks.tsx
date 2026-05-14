"use client";

import { useState, useEffect } from "react";
import type { StoryCluster } from "@/types";
import { trackEvent } from "@/lib/analytics";

function SourceDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <span>{new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}</span>;
}

export default function SourceLinks({ cluster }: { cluster: StoryCluster }) {
  return (
    <div className="border-t border-gray-100 pt-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Original Sources
      </h3>
      <div className="space-y-4">
        {cluster.articles.map((article) => (
          <div
            key={article.id}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      article.sourceTier === 1
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {article.sourceTier === 1 ? "Primary" : "Secondary"}
                  </span>
                  <span className="text-xs text-gray-400">{article.sourceName}</span>
                </div>
                <h4 className="font-medium text-sm text-gray-900 mb-1">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {article.description || article.content?.slice(0, 200)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <SourceDate date={article.publishedAt} />
                </div>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Source", "click", article.sourceName)}
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Read
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
