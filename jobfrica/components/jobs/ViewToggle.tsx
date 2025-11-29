'use client'

import { Grid3X3, List } from 'lucide-react'

export type ViewMode = 'grid' | 'list'

export interface ViewToggleProps {
  /** Current view mode */
  viewMode: ViewMode
  /** Callback function called when view mode changes */
  onViewChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  const buttonClass = "p-2 rounded-lg transition-colors flex items-center justify-center"
  const activeClass = "bg-blue-600 text-white"
  const inactiveClass = "text-gray-600 hover:text-gray-900 hover:bg-gray-100"

  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 bg-white" data-testid="view-toggle">
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        className={`${buttonClass} ${viewMode === 'grid' ? activeClass : inactiveClass}`}
        aria-label="Grid view"
        aria-pressed={viewMode === 'grid'}
        title="Switch to grid view"
        data-testid="grid-view-button"
      >
        <Grid3X3 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => onViewChange('list')}
        className={`${buttonClass} ${viewMode === 'list' ? activeClass : inactiveClass}`}
        aria-label="List view"
        aria-pressed={viewMode === 'list'}
        title="Switch to list view"
        data-testid="list-view-button"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  )
}