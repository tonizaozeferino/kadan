"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface StatusSectionProps {
  whatDone: string;
  whatNext: string;
  onSave: (data: { whatDone: string; whatNext: string }) => void;
}

export default function StatusSection({
  whatDone: initialDone,
  whatNext: initialNext,
  onSave,
}: StatusSectionProps) {
  const [whatDone, setWhatDone] = useState(initialDone);
  const [whatNext, setWhatNext] = useState(initialNext);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Update state when props change (e.g. project switch)
  useEffect(() => {
    setWhatDone(initialDone);
    setWhatNext(initialNext);
  }, [initialDone, initialNext]);

  const debouncedSave = useCallback(
    (done: string, next: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave({ whatDone: done, whatNext: next });
      }, 1000);
    },
    [onSave]
  );

  const handleDoneChange = (val: string) => {
    setWhatDone(val);
    debouncedSave(val, whatNext);
  };

  const handleNextChange = (val: string) => {
    setWhatNext(val);
    debouncedSave(whatDone, val);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Daily Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            ✅ Was erledigt (What was done)
          </label>
          <textarea
            value={whatDone}
            onChange={(e) => handleDoneChange(e.target.value)}
            placeholder="What did you accomplish today?"
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            🎯 Nächste Schritte (Next steps)
          </label>
          <textarea
            value={whatNext}
            onChange={(e) => handleNextChange(e.target.value)}
            placeholder="What are the next steps?"
            rows={6}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden resize-y"
          />
        </div>
      </div>
    </div>
  );
}
