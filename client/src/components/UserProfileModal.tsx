import React from 'react'
import { X, Heart } from 'lucide-react'
import { Project } from '../types'

interface UserProfileModalProps {
  authorName: string
  projects: Project[]
  onClose: () => void
  onProjectClick: (project: Project) => void
}

const Avatar = ({ initials, size = 60 }: { initials: string; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
    style={{
      width: size,
      height: size,
      backgroundColor: '#1a6b3a',
      fontSize: size * 0.35,
      fontFamily: 'Cormorant Garamond, Georgia, serif',
    }}
  >
    {initials}
  </div>
)

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  authorName,
  projects,
  onClose,
  onProjectClick,
}) => {
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Avatar initials={initials} size={52} />
            <div>
              <h2
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
              >
                {authorName}
              </h2>
              <p
                className="text-gray-400 text-sm"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
              >
                {projects.length} work{projects.length !== 1 ? 's' : ''} in the gallery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Project grid */}
        <div className="overflow-y-auto p-6">
          {projects.length === 0 ? (
            <p
              className="text-center text-gray-400 py-8"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
            >
              No works found for this artist.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onProjectClick(p)}
                  className="text-left rounded-xl overflow-hidden border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="h-28 w-full overflow-hidden"
                    style={{ background: p.imageUrl ? undefined : p.gradient }}
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <p
                      className="font-semibold text-gray-800 text-sm leading-tight mb-0.5 group-hover:text-green-800 transition-colors"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      {p.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-gray-400 text-xs"
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                      >
                        {p.classCode ?? p.projectType} · {p.year}
                      </p>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Heart size={11} />
                        {p.likes}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfileModal
