import React, { useState } from 'react'
import { X, Send } from 'lucide-react'
import { Message } from '../types'

interface MessageModalProps {
  recipientName: string
  recipientId?: string
  onClose: () => void
  onSend: (msg: Omit<Message, 'id' | 'sentAt' | 'direction'> & { recipientId?: string }) => void
}

const MessageModal: React.FC<MessageModalProps> = ({ recipientName, recipientId, onClose, onSend }) => {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    onSend({ correspondent: recipientName, subject, body, recipientId, correspondentId: recipientId ?? '' })
    setSent(true)
  }

  if (sent) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#1a6b3a' }}
          >
            <Send size={22} className="text-white" />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
          >
            Message Sent
          </h3>
          <p
            className="text-gray-500 text-sm mb-6"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Your message to <strong>{recipientName}</strong> has been delivered.
            <br />They'll be in touch soon.
          </p>
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: '#1a6b3a' }}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3
            className="text-lg font-bold"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
          >
            Message to Collaborate
          </h3>
          <button
            onClick={onClose}
            aria-label="Close message modal"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              To
            </label>
            <input
              type="text"
              value={recipientName}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-700 text-sm border border-gray-200 cursor-not-allowed"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Re: Collaboration on your project..."
              className="w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi! I came across your work on DiPs and would love to explore a collaboration..."
              rows={5}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow resize-none"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            <Send size={15} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageModal
