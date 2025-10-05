// components/availability/AvailabilityCalendar.tsx
// Calendar that lets users pick a single availability date for appointment scheduling.
// - Uses shadcn Calendar wrapper (react-day-picker under the hood)
// - Limits selection to today..today+13 (next 2 weeks)
// - Emits single ISO date string (YYYY-MM-DD) via onChange for easy DB use
// - Provides visual feedback with emerald shading for selected date
// - Single-select mode for appointment scheduling workflow
"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  initial?: string | null; // optional prefilled ISO date (YYYY-MM-DD)
  onChange?: (isoDate: string | null) => void; // single date or null
  className?: string;
};

/**
 * Convert Date object to ISO date string (YYYY-MM-DD)
 * Only includes date part for scheduling day-level availability
 * Ensures consistent format for database storage
 */
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

/**
 * Single-date availability calendar component
 *
 * Features:
 * - Single-select mode for choosing one appointment date
 * - 14-day window (today through today+13) to focus on near-term scheduling
 * - ISO date string output for consistent database integration
 * - Clear button to reset selection
 * - Visual preview of selected date
 * - Responsive design that works on mobile and desktop
 */
export default function AvailabilityCalendar({
  initial = null,
  onChange,
  className,
}: Props) {
  // Convert incoming ISO string to Date object for react-day-picker
  // Handle null/undefined initial values gracefully
  const initialDate = useMemo(
    () => (initial ? new Date(`${initial}T00:00:00`) : undefined),
    [initial]
  );

  // Track currently selected date in component state (single Date or undefined)
  const [selected, setSelected] = useState<Date | undefined>(initialDate);

  // Calculate the date range for availability (next 14 days)
  // Using useMemo to avoid recalculating on every render
  const today = useMemo(() => new Date(), []);
  const end = useMemo(() => addDays(today, 13), [today]);

  // Disable dates outside our 14-day window
  // This prevents users from selecting dates too far in the future
  const disabled = [{ before: today, after: end }];

  // Emit ISO date string to parent component whenever selection changes
  // This keeps the parent in sync with user selection
  useEffect(() => {
    onChange?.(selected ? toISO(selected) : null);
  }, [selected, onChange]);

  /**
   * Handle clear action - reset selection
   * Useful when user wants to choose a different date
   */
  const handleClear = () => {
    setSelected(undefined);
  };

  return (
    <div className={className}>
      {/* Section header with clear instructions */}
      <div className="mb-3 text-sm font-medium text-slate-900">
        Select your preferred appointment date
      </div>

      {/* Calendar container with shadcn-style border and padding */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Calendar
          mode="single" // Enable single-date selection
          selected={selected} // Currently selected date
          onSelect={(date) => setSelected(date)} // Handle selection changes
          disabled={disabled} // Enforce 14-day window
          showOutsideDays={false} // Hide dates from other months for cleaner look
        />
      </div>

      {/* Footer with date range info and clear button */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {/* Show the available date range to user */}
        <div className="text-xs text-slate-600">
          Available: {format(today, "MMM d")} – {format(end, "MMM d")}
        </div>

        {/* Action buttons area */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50 transition-colors"
            disabled={!selected}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Preview section showing selected date in a nice format */}
      {selected && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="text-xs font-medium text-emerald-800 mb-2">
            Selected appointment date:
          </div>

          {/* Display selected date in user-friendly format */}
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-sm font-medium text-emerald-800 shadow-sm">
              {format(selected, "EEEE, MMM d, yyyy")}
            </span>
          </div>

          {/* Technical preview for developers (can be removed in production) */}
          <div className="mt-2 text-xs text-emerald-700 opacity-75">
            ISO format: {toISO(selected)}
          </div>
        </div>
      )}
    </div>
  );
}
