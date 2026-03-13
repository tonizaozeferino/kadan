"use client";

import { useState, useCallback } from "react";

interface StatusEntry {
  id: string;
  date: string;
  whatDone: string | null;
  whatNext: string | null;
  project: string;
}

interface WeekGroup {
  label: string;
  entries: StatusEntry[];
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatWeekLabel(monday: Date): string {
  return `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function formatEntryDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupByWeek(entries: StatusEntry[]): WeekGroup[] {
  const groups = new Map<string, { monday: Date; entries: StatusEntry[] }>();

  for (const entry of entries) {
    if (!entry.whatDone && !entry.whatNext) continue;
    const [year, month, day] = entry.date.split("-").map(Number);
    const entryDate = new Date(year, month - 1, day);
    const monday = getMonday(entryDate);
    const key = monday.toISOString().split("T")[0];

    if (!groups.has(key)) {
      groups.set(key, { monday, entries: [] });
    }
    groups.get(key)!.entries.push(entry);
  }

  return Array.from(groups.values())
    .sort((a, b) => b.monday.getTime() - a.monday.getTime())
    .map(({ monday, entries }) => ({
      label: formatWeekLabel(monday),
      entries,
    }));
}

export default function StatusHistory() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<StatusEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [fetched, setFetched] = useState(false);

  const fetchHistory = useCallback(async (numDays: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/status/history?days=${numDays}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Failed to fetch status history:", err);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !fetched) {
      fetchHistory(days);
    }
  };

  const handleLoadMore = () => {
    const nextDays = Math.min(days + 30, 90);
    setDays(nextDays);
    fetchHistory(nextDays);
  };

  const weeks = groupByWeek(entries);

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100">
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <span className="text-sm font-semibold text-gray-600">
          View Status History
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {loading && !entries.length ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : weeks.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No past entries found.</p>
          ) : (
            <div className="space-y-6 pt-4">
              {weeks.map((week) => (
                <div key={week.label}>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-100 pb-2">
                    {week.label}
                  </h3>
                  <div className="space-y-3">
                    {week.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-gray-50 rounded-lg p-4 text-sm"
                      >
                        <p className="font-semibold text-gray-700 mb-2">
                          {formatEntryDate(entry.date)}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {entry.whatDone && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Done</p>
                              <p className="text-gray-700 whitespace-pre-line">{entry.whatDone}</p>
                            </div>
                          )}
                          {entry.whatNext && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Next</p>
                              <p className="text-gray-700 whitespace-pre-line">{entry.whatNext}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {days < 90 && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
