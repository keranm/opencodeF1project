"use client";

import { useState, useEffect } from "react";
import type { RaceCalendarEntry } from "@/types";

function ClientDate({ date }: { date: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    );
  }, [date]);
  if (!text) return <span className="text-gray-300">—</span>;
  return <span className="text-gray-500">{text}</span>;
}

function CountdownContent({ targetDate }: { targetDate: string }) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setDisplay("Race completed");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) {
        setDisplay(`${days}d ${hours}h until race`);
      } else if (hours > 0) {
        setDisplay(`${hours}h until race`);
      } else {
        setDisplay("Race day!");
      }
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!display) return null;
  const isCompleted = display === "Race completed";
  return (
    <span className={isCompleted ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
      {display}
    </span>
  );
}

export default function RaceCalendar({
  calendar,
}: {
  calendar: RaceCalendarEntry[];
}) {
  if (calendar.length === 0) return null;

  const upcoming = calendar.find((r) => !r.isCompleted);

  return (
    <div className="space-y-6">
      {upcoming && (
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Next Race</p>
          <h3 className="text-xl font-bold mb-1">Round {upcoming.round}: {upcoming.raceName}</h3>
          <p className="text-sm opacity-80 mb-3">{upcoming.circuit}, {upcoming.locality}</p>
          <CountdownContent targetDate={upcoming.sessionTimes.race} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-sm text-gray-900">2026 Calendar</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {calendar.map((race) => (
            <div key={race.round} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
              <span className="w-8 text-center text-sm font-bold text-gray-400">
                {race.round}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${race.isCompleted ? "text-gray-500" : "text-gray-900"}`}>
                  {race.raceName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {race.circuit}, {race.locality}, {race.country}
                </p>
              </div>
              <div className="text-right text-xs">
                <ClientDate date={race.date} />
                {race.isCompleted ? (
                  <span className="text-green-600">Completed</span>
                ) : (
                  <span className="text-red-600 font-medium">Upcoming</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
