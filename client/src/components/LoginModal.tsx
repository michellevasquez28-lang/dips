import React, { useState } from 'react'
import { X, LogIn } from 'lucide-react'
import { User } from '../types'
import { api } from '../lib/api'

interface LoginModalProps {
  onClose: () => void
  onLogin: (user: User, token: string) => void
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedName) { setError('Please enter your name.'); return }
    if (!trimmedEmail.endsWith('@dartmouth.edu')) {
      setError('Please use your @dartmouth.edu email address.')
      return
    }

    setLoading(true)
    try {
      const { token, user: apiUser } = await api.dartmouthLogin(trimmedName, trimmedEmail)
      const initials = apiUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      const user: User = { id: apiUser.id, name: apiUser.name, email: apiUser.email, initials }
      onLogin(user, token)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200
    focus:outline-none focus:ring-2 focus:ring-green-200 transition-shadow`
  const labelClass = `block text-xs font-semibold uppercase tracking-widest mb-1.5`

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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              className={labelClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#6b7280' }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              autoFocus
            />
          </div>

          <div>
            <label
              className={labelClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#6b7280' }}
            >
              Dartmouth Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="f006xyz@dartmouth.edu"
              className={inputClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            />
          </div>

          {error && (
            <p
              className="text-red-500 text-xs"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            {loading ? 'Signing in…' : 'Sign In'}
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
