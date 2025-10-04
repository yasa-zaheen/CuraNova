// components/ui/calendar.tsx
// Wrapper around react-day-picker styled like shadcn/ui.
// Provides consistent Tailwind classes and a small API surface.
'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

// Import the project's cn helper for consistent class merging
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Calendar (shadcn-style)
 * - Applies Tailwind classes and ARIA-friendly states.
 * - Exposes all DayPicker props so we can use mode="multiple" etc.
 * - Uses emerald color scheme to match medical/health theme
 * - Provides consistent styling with other shadcn components
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        // Layout classes for responsive calendar structure
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        
        // Header styling for month/year display and navigation
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        
        // Navigation button styling (prev/next month)
        nav: 'space-x-1 flex items-center',
        nav_button: 'h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        
        // Table and cell layout for calendar grid
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground w-9 text-center font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative',
        
        // Day styling with accessibility and interaction states
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md transition-colors hover:bg-slate-100',
        
        // Shaded selection style using emerald color (medical/health theme)
        // Selected days get a solid emerald background with white text
        day_selected:
          'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white',
        
        // Today indicator using lighter emerald shade
        day_today: 'bg-emerald-100 text-emerald-900 font-medium',
        
        // States for disabled and outside month days
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-40 hover:bg-transparent',
        day_hidden: 'invisible',
        
        // Allow custom class overrides
        ...classNames,
      }}
      {...props}
    />
  )
}