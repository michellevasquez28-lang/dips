import React, { useState } from 'react'
import { X } from 'lucide-react'
import { User } from '../types'
import { api } from '../lib/api'

interface LoginModalProps {
  onClose: () => void
  onLogin: (user: User, token: string, isNewUser?: boolean) => void
}

function buildUser(apiUser: any): User {
  const initials = apiUser.name
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    initials,
    isAdmin: apiUser.isAdmin ?? false,
    isProfileComplete: apiUser.isProfileComplete ?? false,
  }
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail.endsWith('@dartmouth.edu')) {
      setError('Only @dartmouth.edu addresses are accepted.')
      return
    }
    setLoading(true)
    try {
      const { token, user: apiUser, isNewUser } = await api.dartmouthLogin(
        name.trim(),
        trimmedEmail
      )
      onLogin(buildUser(apiUser), token, isNewUser)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200
    focus:outline-none focus:ring-1 focus:ring-green-600 transition-shadow`

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative px-6 py-5 flex flex-col items-center text-center"
          style={{ backgroundColor: '#1a6b3a' }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          <img
            src="/logo.png"
            alt="DiPs"
            className="mb-3"
            style={{ height: 56, width: 'auto' }}
          />
          <h2
            className="text-white text-lg font-bold leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Sign in with your Dartmouth account
          </h2>
          <p
            className="text-white/70 text-xs mt-1"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
          >
            Connect your uploads and messages to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-3">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Your Name
            </label>
            <input
              className={inputClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Dartmouth Email
            </label>
            <input
              className={inputClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              type="email"
              placeholder="name@dartmouth.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {error && (
            <p
              className="text-red-500 text-xs text-center"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="mt-1 w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p
            className="text-center text-gray-400 text-xs"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
          >
            Only @dartmouth.edu addresses are accepted.
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
