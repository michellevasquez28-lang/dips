import React, { useState, useEffect, useRef, useMemo } from 'react'
import { ArrowLeft, Send, Inbox, ChevronRight } from 'lucide-react'
import { Message, User } from '../types'
import { api } from '../lib/api'

interface MessagesPageProps {
  messages: Message[]
  currentUser: User | null
  authToken: string | null
  onGoHome: () => void
  onMessageAdded: (msg: Message) => void
}

const Avatar = ({ name, size = 38 }: { name: string; size?: number }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-semibold text-white"
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
}

const MessagesPage: React.FC<MessagesPageProps> = ({
  messages,
  currentUser,
  authToken,
  onGoHome,
  onMessageAdded,
}) => {
  const [selectedConversant, setSelectedConversant] = useState<{ id: string; name: string } | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const threadBottomRef = useRef<HTMLDivElement>(null)

  // Deduplicate messages into conversations — one row per unique correspondent, newest first
  const conversations = useMemo(() => {
    const seen = new Set<string>()
    const result: Array<{ id: string; name: string; lastMsg: Message }> = []
    for (const msg of messages) {
      const cid = msg.correspondentId ?? msg.correspondent
      if (!seen.has(cid)) {
        seen.add(cid)
        result.push({ id: cid, name: msg.correspondent, lastMsg: msg })
      }
    }
    return result
  }, [messages])

  // Load full thread when a conversation is selected
  useEffect(() => {
    if (!selectedConversant || !currentUser || !authToken) return
    setLoadingThread(true)
    setThreadMessages([])
    api
      .getThread(currentUser.id, selectedConversant.id, authToken)
      .then(setThreadMessages)
      .catch(console.error)
      .finally(() => setLoadingThread(false))
  }, [selectedConversant?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom whenever thread messages change
  useEffect(() => {
    threadBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [threadMessages])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !currentUser || !authToken || !selectedConversant) return
    setSending(true)
    try {
      const saved = await api.sendMessage(
        currentUser.id,
        selectedConversant.id,
        '',
        replyText.trim(),
        authToken
      )
      setThreadMessages((prev) => [...prev, saved])
      onMessageAdded(saved)
      setReplyText('')
    } catch (err) {
      console.error('Failed to send reply', err)
    } finally {
      setSending(false)
    }
  }

  // ── Thread view ──────────────────────────────────────────────────────────
  if (selectedConversant) {
    return (
      <div className="flex-1 flex flex-col h-screen bg-white">
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ backgroundColor: '#1a6b3a', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        >
          <button
            onClick={() => setSelectedConversant(null)}
            aria-label="Back to messages"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <Avatar name={selectedConversant.name} size={34} />
          <p
            className="font-semibold text-white"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 17 }}
          >
            {selectedConversant.name}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2 bg-gray-50">
          {loadingThread ? (
            <div className="flex items-center justify-center h-full">
              <div
                className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#1a6b3a', borderTopColor: 'transparent' }}
              />
            </div>
          ) : threadMessages.length === 0 ? (
            <p
              className="text-center text-gray-400 text-sm mt-12"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
            >
              No messages yet — send the first one!
            </p>
          ) : (
            threadMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'sent' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.direction === 'received' && (
                  <Avatar name={selectedConversant.name} size={28} />
                )}
                <div
                  className={`max-w-[70%] px-4 py-2.5 shadow-sm ${
                    msg.direction === 'sent' ? 'ml-10' : 'ml-2 mr-10'
                  }`}
                  style={{
                    backgroundColor: msg.direction === 'sent' ? '#1a6b3a' : '#ffffff',
                    color: msg.direction === 'sent' ? 'white' : '#1a1a1a',
                    borderRadius:
                      msg.direction === 'sent'
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    border: msg.direction === 'received' ? '1px solid #e5e7eb' : 'none',
                  }}
                >
                  {msg.subject && (
                    <p
                      className="text-xs font-semibold mb-1 opacity-70"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      {msg.subject}
                    </p>
                  )}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {msg.body}
                  </p>
                  <p
                    className="text-xs mt-1 opacity-50 text-right"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {msg.sentAt}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={threadBottomRef} />
        </div>

        {/* Reply box */}
        <form
          onSubmit={handleReply}
          className="flex items-center gap-2 px-4 py-3 border-t border-gray-100 bg-white shrink-0"
        >
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a message…"
            className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-200 transition-shadow"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          />
          <button
            type="submit"
            disabled={!replyText.trim() || sending}
            aria-label="Send reply"
            className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: '#1a6b3a', flexShrink: 0 }}
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    )
  }

  // ── Conversations list ───────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4 shrink-0"
        style={{ backgroundColor: '#1a6b3a', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
      >
        <button
          onClick={onGoHome}
          aria-label="Back to gallery"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1
            className="text-xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            Messages
          </h1>
          <p
            className="text-white/60 text-xs"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
          >
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(26,107,58,0.08)' }}
            >
              <Inbox size={28} style={{ color: '#1a6b3a' }} />
            </div>
            <div>
              <p
                className="text-gray-700 font-semibold text-lg mb-1"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                No messages yet
              </p>
              <p
                className="text-gray-400 text-sm"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
              >
                Open a project and click "Message to Collaborate" to reach out to a creator.
              </p>
            </div>
            <button
              onClick={onGoHome}
              className="mt-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Browse the Gallery
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversant({ id: convo.id, name: convo.name })}
                className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 group"
              >
                <Avatar name={convo.name} size={46} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span
                      className="font-semibold text-gray-800 text-sm"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      {convo.name}
                    </span>
                    <span
                      className="text-gray-400 text-xs shrink-0"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                    >
                      {convo.lastMsg.sentAt}
                    </span>
                  </div>
                  {convo.lastMsg.subject && (
                    <p
                      className="text-xs font-medium text-gray-600 truncate mb-0.5"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      {convo.lastMsg.subject}
                    </p>
                  )}
                  <p
                    className="text-xs text-gray-400 truncate"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                  >
                    {convo.lastMsg.direction === 'sent' ? 'You: ' : ''}
                    {convo.lastMsg.body}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 shrink-0 group-hover:text-gray-400 transition-colors"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
