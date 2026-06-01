import React, { useState } from 'react'
import { X } from 'lucide-react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { User } from '../types'
import { api } from '../lib/api'

interface LoginModalProps {
  onClose: () => void
  onLogin: (user: User, token: string) => void
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google sign-in failed. Please try again.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { token, user: apiUser } = await api.googleLogin(credentialResponse.credential)
      const initials = apiUser.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      const user: User = { id: apiUser.id, name: apiUser.name, email: apiUser.email, initials }
      onLogin(user, token)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.')
  }

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
        <div className="p-6 flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 py-3">
              <div className="w-5 h-5 border-2 border-[#1a6b3a] border-t-transparent rounded-full animate-spin" />
              <span
                className="text-sm text-gray-500"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                Signing in…
              </span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="rectangular"
              text="signin_with"
              locale="en"
              width="280"
            />
          )}

          {error && (
            <p
              className="text-red-500 text-xs text-center"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {error}
            </p>
          )}

          <p
            className="text-center text-gray-400 text-xs"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
          >
            Only @dartmouth.edu addresses are accepted.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
