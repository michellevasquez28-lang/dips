import React from 'react'
import { Menu, Plus, Home, Minus, LogIn } from 'lucide-react'
import { User } from '../types'

interface TopNavProps {
  onOpenSidebar: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onGoHome: () => void
  currentUser: User | null
  onLoginClick: () => void
}

const TopNav: React.FC<TopNavProps> = ({
  onOpenSidebar,
  onZoomIn,
  onZoomOut,
  onGoHome,
  currentUser,
  onLoginClick,
}) => (
  <div
    className="flex items-center justify-between px-3 shrink-0 z-20"
    style={{
      height: 48,
      backgroundColor: '#1a6b3a',
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
    }}
  >
    {/* Left: hamburger + logo */}
    <div className="flex items-center gap-2">
      <button
        onClick={onOpenSidebar}
        aria-label="Open navigation panel"
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15 transition-colors"
      >
        <Menu size={18} className="text-white" />
      </button>
      <img
        src="/logo.png"
        alt="DiPs"
        style={{ height: 32, width: 'auto', display: 'block' }}
      />
    </div>

    {/* Right: hint + zoom + user */}
    <div className="flex items-center gap-3">
      <p
        className="text-white/55 text-xs hidden sm:block"
        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
      >
        Drag · Scroll to zoom · Click to open
      </p>
      <div className="flex items-center gap-1.5">
        {[
          { icon: <Plus size={13} />, label: 'Zoom in', action: onZoomIn },
          { icon: <Home size={13} />, label: 'Go to home', action: onGoHome },
          { icon: <Minus size={13} />, label: 'Zoom out', action: onZoomOut },
        ].map(({ icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            className="w-8 h-8 flex items-center justify-center transition-all hover:bg-white/20 active:scale-95"
            style={{
              border: '1.5px solid rgba(255,255,255,0.45)',
              borderRadius: 4,
              color: 'white',
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Auth indicator */}
      {currentUser ? (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white text-xs shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          title={currentUser.name}
        >
          {currentUser.initials}
        </div>
      ) : (
        <button
          onClick={onLoginClick}
          aria-label="Sign in"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-white/80 hover:bg-white/15 transition-colors"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <LogIn size={12} />
          Sign in
        </button>
      )}
    </div>
  </div>
)

export default TopNav
