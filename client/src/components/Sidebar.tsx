import React, { useState } from 'react'
import { Search, Plus, Home, Minus, Menu, Mail, LogIn, LogOut } from 'lucide-react'
import FilterPanel from './FilterPanel'
import { FilterState, User } from '../types'

interface SidebarProps {
  projectCount: number
  searchQuery: string
  onSearchChange: (q: string) => void
  filters: FilterState
  onFiltersChange: (f: FilterState) => void
  onApplyFilters: () => void
  onClearFilters: () => void
  onUploadClick: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onGoHome: () => void
  onViewMessages: () => void
  onCollapse: () => void
  currentUser: User | null
  onLoginClick: () => void
  onLogout: () => void
  onMyProfile?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
  projectCount,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onUploadClick,
  onZoomIn,
  onZoomOut,
  onGoHome,
  onViewMessages,
  onCollapse,
  currentUser,
  onLoginClick,
  onLogout,
  onMyProfile,
}) => {
  const [filterOpen, setFilterOpen] = useState(false)

  return (
    <div
      className="flex flex-col h-screen shrink-0 relative z-20"
      style={{
        width: 310,
        backgroundColor: '#1a6b3a',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo + collapse button */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-2">
        <img
          src="/logo.png"
          alt="DiPs — Dartmouth Innovative Projects Studio"
          style={{ flex: 1, minWidth: 0, borderRadius: 10, display: 'block' }}
        />
        <button
          onClick={onCollapse}
          aria-label="Collapse navigation panel"
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15 transition-colors mt-1 shrink-0"
        >
          <Menu size={16} className="text-white" />
        </button>
      </div>

      {/* Scrollable middle section */}
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="px-5 mt-1 mb-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Title, Author..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search projects by title or author"
              className="w-full pl-9 pr-4 py-2.5 rounded-full text-sm bg-white text-gray-700
                         placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40
                         transition-shadow"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            />
          </div>
        </div>

        {/* Filter By */}
        <div className="px-5 mb-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            aria-label="Open filter panel"
            aria-expanded={filterOpen}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded text-white text-sm font-medium"
            style={{
              backgroundColor: '#145530',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <span>Filter By</span>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: filterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <path d="M2 4.5L7 9.5L12 4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {filterOpen && (
            <FilterPanel
              filters={filters}
              onChange={onFiltersChange}
              onApply={() => { onApplyFilters(); setFilterOpen(false) }}
              onClear={() => { onClearFilters(); setFilterOpen(false) }}
            />
          )}
        </div>

        {/* Upload Work */}
        <div className="px-5 pb-3">
          <button
            onClick={onUploadClick}
            aria-label="Upload your work to the gallery"
            className="w-full py-3 rounded font-bold text-sm tracking-wide transition-all
                       hover:bg-white/90 active:scale-95"
            style={{
              backgroundColor: 'white',
              color: '#1a6b3a',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontSize: 15,
              letterSpacing: '0.08em',
            }}
          >
            UPLOAD WORK
          </button>
        </div>

        {/* View Messages */}
        <div className="px-5 pb-4">
          <button
            onClick={onViewMessages}
            aria-label="View your messages"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Mail size={14} />
            View Messages
          </button>
        </div>
      </div>

      {/* Help text */}
      <div className="px-6 pb-3">
        <p
          className="text-white/70 text-xs leading-relaxed"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
        >
          Drag to explore
          <br />Scroll to zoom
          <br />Click a frame to open
        </p>
      </div>

      {/* Zoom controls */}
      <div className="px-6 pb-3 flex items-center gap-2">
        {[
          { icon: <Plus size={14} />, label: 'Zoom in', action: onZoomIn },
          { icon: <Home size={14} />, label: 'Go to home', action: onGoHome },
          { icon: <Minus size={14} />, label: 'Zoom out', action: onZoomOut },
        ].map(({ icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            className="w-9 h-9 flex items-center justify-center transition-all
                       hover:bg-white/20 active:scale-95"
            style={{
              border: '1.5px solid rgba(255,255,255,0.55)',
              borderRadius: 4,
              color: 'white',
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Project count */}
      <div className="px-6 pb-3">
        <p
          className="text-white/55 text-xs"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
        >
          {projectCount} projects
        </p>
      </div>

      {/* Auth section */}
      <div className="px-5 pb-5 border-t border-white/15 pt-3">
        {currentUser ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onMyProfile}
              aria-label="View my profile"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-white text-xs hover:ring-2 hover:ring-white/40 transition-all"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {currentUser.initials}
            </button>
            <button
              onClick={onMyProfile}
              className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
            >
              <p
                className="text-white text-xs font-semibold truncate leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {currentUser.name}
              </p>
              <p
                className="text-white/50 text-xs truncate"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                My profile
              </p>
            </button>
            <button
              onClick={onLogout}
              aria-label="Sign out"
              className="shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-white/15 transition-colors"
              title="Sign out"
            >
              <LogOut size={13} className="text-white/70" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            aria-label="Sign in with Dartmouth"
            className="w-full flex items-center justify-center gap-2 py-2 rounded text-sm transition-all hover:bg-white/10 active:scale-95"
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Cormorant Garamond, Georgia, serif',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <LogIn size={13} />
            Sign in with Dartmouth
          </button>
        )}
      </div>
    </div>
  )
}

export default Sidebar
