import React, { useState } from 'react'
import { X } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
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
  const [showEmailForm, setShowEmailForm] = useState(false)

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return
    setError('')
    setLoading(true)
    try {
      const { token, user: apiUser, isNewUser } = await api.googleLogin(
        credentialResponse.credential
      )
      onLogin(buildUser(apiUser), token, isNewUser)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
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

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Google sign-in */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed. Please try the email option below.')}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              hosted_domain="dartmouth.edu"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span
              className="text-xs text-gray-400"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
            >
              or use your Dartmouth email
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form toggle */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-2.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-all"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Sign in with name + email
            </button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
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
              <button
                type="submit"
                disabled={loading || !name.trim() || !email.trim()}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          {error && (
            <p
              className="text-red-500 text-xs text-center -mt-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginModal
