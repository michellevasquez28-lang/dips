import React from 'react'

interface LandingPageProps {
  onEnter: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{ background: '#0a0a0a', minHeight: '100vh' }}
    >
      <img
        src="/logo.png"
        alt="DiPs — Dartmouth Innovative Projects Studio"
        style={{ width: 420, maxWidth: '80vw' }}
      />

      <p
        style={{
          color: 'rgba(255,255,255,0.45)',
          marginTop: 12,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 15,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontStyle: 'italic',
        }}
      >
        Student project gallery
      </p>

      <button
        onClick={onEnter}
        style={{
          marginTop: 48,
          padding: '14px 56px',
          background: '#1a6b3a',
          color: 'white',
          borderRadius: 4,
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 16,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#145530')}
        onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#1a6b3a')}
      >
        Enter Gallery
      </button>
    </div>
  )
}

export default LandingPage
