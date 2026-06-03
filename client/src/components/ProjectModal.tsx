import React, { useState } from 'react'
import { X, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Maximize2, Minimize2, Trash2 } from 'lucide-react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import '../lib/pdfSetup'
import { Project, Message, User } from '../types'
import MessageModal from './MessageModal'

interface ProjectModalProps {
  project: Project
  currentUser: User | null
  onClose: () => void
  onLike: (id: string, userId: string) => void
  onUnlike: (id: string, userId: string) => void
  onComment: (projectId: string, text: string, userId: string, userName: string) => void
  onAuthorClick: (authorDbId: string) => void
  onMessageSent: (msg: Omit<Message, 'id' | 'sentAt' | 'direction'> & { recipientId?: string }) => void
  onDelete: (id: string, authorDbId: string) => void
  onSignInRequired: () => void
}

const Avatar = ({ initials, size = 36 }: { initials: string; size?: number }) => (
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

const PDFViewer = ({ pdfUrl }: { pdfUrl: string }) => {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  const viewer = (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center'
          : 'relative flex flex-col items-center'
      }
    >
      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          aria-label="Exit fullscreen"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Minimize2 size={20} className="text-white" />
        </button>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        className={fullscreen ? '' : 'rounded-xl overflow-hidden shadow'}
      >
        <Page
          pageNumber={pageNumber}
          width={fullscreen ? Math.min(window.innerWidth * 0.9, 900) : 560}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>

      {numPages > 0 && (
        <div
          className={`flex items-center gap-3 mt-3 px-4 py-2 rounded-full shadow-md ${
            fullscreen ? 'bg-white/10 text-white' : 'bg-white border border-gray-100 text-gray-700'
          }`}
        >
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            aria-label="Previous page"
            className="disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="text-sm tabular-nums"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            aria-label="Next page"
            className="disabled:opacity-30 hover:opacity-70 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
          {!fullscreen && (
            <button
              onClick={() => setFullscreen(true)}
              aria-label="View fullscreen"
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  )

  return viewer
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  currentUser,
  onClose,
  onLike,
  onUnlike,
  onComment,
  onAuthorClick,
  onMessageSent,
  onDelete,
  onSignInRequired,
}) => {
  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentAuthor, setCommentAuthor] = useState(currentUser?.name ?? '')
  const [showMessage, setShowMessage] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isOwner =
    !!currentUser &&
    !!project.authorDbId &&
    currentUser.id === project.authorDbId
  const canDelete = isOwner || !!currentUser?.isAdmin

  const handleLike = () => {
    if (!currentUser) { onSignInRequired(); return }
    if (liked) {
      setLiked(false)
      onUnlike(project.id, currentUser.id)
    } else {
      setLiked(true)
      onLike(project.id, currentUser.id)
    }
  }

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !commentText.trim()) return
    onComment(project.id, commentText.trim(), currentUser.id, currentUser.name)
    setCommentText('')
  }

  const handleDelete = () => {
    if (!currentUser) return
    onDelete(project.id, currentUser.id)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <div className="sticky top-0 bg-white z-10 flex justify-end px-5 pt-4 pb-1">
            <button
              onClick={onClose}
              aria-label="Close project modal"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Hero: PDF viewer or image/gradient */}
          <div className="mx-5 mb-5">
            {project.pdfUrl ? (
              <PDFViewer pdfUrl={project.pdfUrl} />
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ height: 260 }}>
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full" style={{ background: project.gradient }} />
                )}
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            {/* Title + department */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2
                className="text-3xl font-bold leading-tight"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
              >
                {project.title}
              </h2>
              <span
                className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full mt-1"
                style={{
                  backgroundColor: 'rgba(26,107,58,0.1)',
                  color: '#1a6b3a',
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  border: '1px solid rgba(26,107,58,0.25)',
                }}
              >
                {project.department}
              </span>
            </div>

            {/* Author — clickable */}
            <button
              onClick={() => onAuthorClick(project.authorDbId ?? '')}
              className="flex items-center gap-3 mb-4 group hover:opacity-80 transition-opacity text-left"
              aria-label={`View all works by ${project.author}`}
            >
              <Avatar initials={project.authorInitials} size={38} />
              <div>
                <p
                  className="font-semibold text-gray-800 leading-tight group-hover:underline"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 16 }}
                >
                  {project.author}
                </p>
                <p
                  className="text-gray-400 text-xs"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                >
                  {project.classCode ?? project.projectType} · {project.year}
                </p>
              </div>
            </button>

            {/* Description */}
            <p
              className="text-gray-600 leading-relaxed mb-4"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 15 }}
            >
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: '#f5f5f5',
                    color: '#666',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-100">
              <button
                onClick={handleLike}
                aria-label={liked ? 'Unlike this project' : !currentUser ? 'Sign in to like this project' : 'Like this project'}
                title={!currentUser ? 'Sign in to like' : undefined}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: liked ? '#fef2f2' : '#f9f9f9',
                  color: liked ? '#e53935' : '#888',
                  border: `1px solid ${liked ? '#fecaca' : '#e5e5e5'}`,
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  cursor: !currentUser ? 'pointer' : undefined,
                }}
              >
                <Heart
                  size={15}
                  fill={liked ? '#e53935' : 'none'}
                  color={liked ? '#e53935' : 'currentColor'}
                />
                {project.likes}
              </button>

              <button
                onClick={() => currentUser ? setShowMessage(true) : onSignInRequired()}
                aria-label="Send a message to collaborate"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 text-white"
                style={{
                  backgroundColor: '#1a6b3a',
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                }}
              >
                <Send size={14} />
                Message to Collaborate
              </button>

              {/* Delete — only for the project owner */}
              {canDelete && !confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete this project"
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95 ml-auto"
                  style={{
                    backgroundColor: '#fff5f5',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}

              {canDelete && confirmDelete && (
                <div className="flex items-center gap-2 flex-wrap ml-auto">
                  <span
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    Remove from gallery?
                  </span>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#dc2626', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={16} className="text-gray-400" />
                <h3
                  className="font-semibold text-gray-700 text-sm"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {project.comments.length} Comment{project.comments.length !== 1 ? 's' : ''}
                </h3>
              </div>

              <div className="space-y-4 mb-5">
                {project.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar initials={comment.authorInitials} size={32} />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-semibold text-gray-800 text-sm"
                          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                        >
                          {comment.authorName}
                        </span>
                        <span className="text-gray-400 text-xs">{comment.createdAt}</span>
                      </div>
                      <p
                        className="text-gray-600 text-sm mt-0.5 leading-relaxed"
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                      >
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              {currentUser ? (
                <form onSubmit={handleComment} className="flex flex-col gap-2">
                  <p
                    className="text-xs text-gray-400 mb-0.5"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                  >
                    Commenting as <span className="font-semibold text-gray-600">{currentUser.name}</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      required
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-1 text-gray-800"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    />
                    <button
                      type="submit"
                      aria-label="Post comment"
                      className="px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 active:scale-95"
                      style={{ backgroundColor: '#1a6b3a' }}
                    >
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(26,107,58,0.05)', border: '1px solid rgba(26,107,58,0.15)' }}
                >
                  <p
                    className="text-sm text-gray-500"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
                  >
                    Sign in to leave a comment
                  </p>
                  <button
                    onClick={onSignInRequired}
                    className="px-4 py-1.5 rounded-full text-white text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMessage && (
        <MessageModal
          recipientName={project.author}
          recipientId={project.authorDbId}
          onClose={() => setShowMessage(false)}
          onSend={onMessageSent}
        />
      )}
    </>
  )
}

export default ProjectModal
