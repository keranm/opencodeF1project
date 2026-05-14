"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { StoryCluster } from "@/types";
import CategoryBadge, { getCategoryGradient } from "./CategoryBadge";

function CarouselDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <span>{new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}</span>;
}

export default function HeroCarousel({ clusters }: { clusters: StoryCluster[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((i: number) => setCurrent(i), []);
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % clusters.length);
  }, [clusters.length]);

  useEffect(() => {
    if (isPaused || clusters.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, clusters.length, next]);

  if (clusters.length === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl min-h-[400px] sm:min-h-[500px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {clusters.map((cluster, i) => {
        const gradient = getCategoryGradient(cluster.category);
        return (
          <Link
            key={cluster.slug}
            href={`/story/${cluster.slug}`}
            className={`absolute inset-0 block bg-gradient-to-br ${gradient} transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== current}
            tabIndex={i === current ? 0 : -1}
          >
            {cluster.primaryImageUrl && (
              <img
                src={cluster.primaryImageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
              <div className="mb-3">
                <CategoryBadge category={cluster.category} />
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                {cluster.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base line-clamp-2 mb-4 max-w-2xl">
                {cluster.summarySentence}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{cluster.sourceCount} source{cluster.sourceCount > 1 ? "s" : ""}</span>
                <CarouselDate date={cluster.latestDate} />
              </div>
            </div>
          </Link>
        );
      })}

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {clusters.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "bg-white w-6" : "bg-white/50 hover:bg-white/70 w-2"
            }`}
            aria-label={`Go to story ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
