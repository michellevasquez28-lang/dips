import React, { useRef, useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Canvas, { CanvasHandle } from './components/Canvas'
import ProjectModal from './components/ProjectModal'
import UploadModal from './components/UploadModal'
import MessagesPage from './components/MessagesPage'
import LoginModal from './components/LoginModal'
import ProfileSetupModal from './components/ProfileSetupModal'
import ProfilePage from './pages/ProfilePage'
import { useProjects } from './hooks/useProjects'
import { api } from './lib/api'
import { Project, Message, User } from './types'

// Persist auth for the current tab only (clears when tab is closed)
function loadAuth(): { user: User; token: string } | null {
  try {
    const raw = sessionStorage.getItem('dips_auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function saveAuth(user: User | null, token: string | null) {
  if (user && token) {
    sessionStorage.setItem('dips_auth', JSON.stringify({ user, token }))
  } else {
    sessionStorage.removeItem('dips_auth')
  }
}

type View = 'gallery' | 'messages' | 'profile'

export default function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState<View>('gallery')
  const [profileUserId, setProfileUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const savedAuth = loadAuth()
  const [currentUser, setCurrentUser] = useState<User | null>(savedAuth?.user ?? null)
  const [authToken, setAuthToken] = useState<string | null>(savedAuth?.token ?? null)
  const [showLogin, setShowLogin] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Validate the stored session on load — if the user ID no longer exists
  // (e.g. after a DB reseed), clear the stale session silently.
  useEffect(() => {
    if (!savedAuth?.user?.id || !savedAuth?.token) return
    api.getUser(savedAuth.user.id, savedAuth.token).catch(() => {
      setCurrentUser(null)
      setAuthToken(null)
      saveAuth(null, null)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!currentUser || !authToken) { setMessages([]); return }
    setMessagesLoading(true)
    api.getMessages(currentUser.id, authToken)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setMessagesLoading(false))
  }, [currentUser?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const {
    projects,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    isFiltered,
    addProject,
    deleteProject,
    likeProject,
    unlikeProject,
    addComment,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  } = useProjects(authToken)

  const canvasRef = useRef<CanvasHandle>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId) ?? null
    : null

  const handleGoHome = useCallback(() => {
    clearFilters()
    canvasRef.current?.resetView()
    setView('gallery')
    setProfileUserId(null)
  }, [clearFilters])

  const handleMessageSent = useCallback(
    async (msg: Omit<Message, 'id' | 'sentAt' | 'direction'> & { recipientId?: string }) => {
      if (!currentUser || !authToken || !msg.recipientId) return
      try {
        const saved = await api.sendMessage(
          currentUser.id,
          msg.recipientId,
          msg.subject,
          msg.body,
          authToken
        )
        setMessages((prev) => [saved, ...prev])
      } catch (e) {
        console.error('Failed to send message', e)
      }
    },
    [currentUser, authToken]
  )

  const handleLogin = useCallback((user: User, token: string, isNewUser?: boolean) => {
    setCurrentUser(user)
    setAuthToken(token)
    saveAuth(user, token)
    if (isNewUser) setShowProfileSetup(true)
  }, [])

  const handleLogout = useCallback(() => {
    setCurrentUser(null)
    setAuthToken(null)
    setMessages([])
    saveAuth(null, null)
    setView('gallery')
    setProfileUserId(null)
  }, [])

  const handleUploadClick = useCallback(() => {
    if (!currentUser) { setShowLogin(true) } else { setUploadOpen(true) }
  }, [currentUser])

  const handleAuthorClick = useCallback((authorDbId: string) => {
    if (!authorDbId) return
    setSelectedProjectId(null)  // close project modal
    setProfileUserId(authorDbId)
    setView('profile')
  }, [])

  const handleMyProfile = useCallback(() => {
    if (!currentUser) return
    setProfileUserId(currentUser.id)
    setView('profile')
  }, [currentUser])

  // Gallery layout
  const galleryContent = (
    <div className="flex-1 overflow-hidden relative flex flex-col">
      {!sidebarOpen && (
        <TopNav
          onOpenSidebar={() => setSidebarOpen(true)}
          onZoomIn={() => canvasRef.current?.zoomIn()}
          onZoomOut={() => canvasRef.current?.zoomOut()}
          onGoHome={handleGoHome}
          currentUser={currentUser}
          onLoginClick={() => setShowLogin(true)}
        />
      )}
      {!isMobile && (
        <Canvas
          ref={canvasRef}
          projects={projects}
          onFrameClick={(p: Project) => setSelectedProjectId(p.id)}
          isFiltered={isFiltered}
          hasActiveFilters={hasActiveFilters}
        />
      )}
      {isMobile && (
        <div className="flex-1 overflow-y-auto bg-white p-4 flex flex-col gap-4">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a6b3a' }}
          >
            DiPs Gallery
          </h1>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className="w-full text-left rounded-xl overflow-hidden shadow"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              <div className="h-32" style={{ background: p.imageUrl ? undefined : p.gradient }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3 bg-white">
                <p className="font-bold text-gray-800">{p.title}</p>
                <p className="text-sm text-gray-500">{p.author}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {sidebarOpen && view === 'gallery' && (
        <Sidebar
          projectCount={projects.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
          onUploadClick={handleUploadClick}
          onZoomIn={() => canvasRef.current?.zoomIn()}
          onZoomOut={() => canvasRef.current?.zoomOut()}
          onGoHome={handleGoHome}
          onViewMessages={() => setView('messages')}
          onCollapse={() => setSidebarOpen(false)}
          currentUser={currentUser}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          onMyProfile={handleMyProfile}
        />
      )}

      {view === 'gallery' && galleryContent}

      {view === 'messages' && (
        <MessagesPage
          messages={messages}
          currentUser={currentUser}
          authToken={authToken}
          onGoHome={handleGoHome}
          onMessageAdded={(msg) => setMessages((prev) => [msg, ...prev])}
        />
      )}

      {view === 'profile' && profileUserId && (
        <ProfilePage
          userId={profileUserId}
          currentUser={currentUser}
          authToken={authToken}
          onBack={() => { setView('gallery'); setProfileUserId(null) }}
          onProjectClick={(projectId) => setSelectedProjectId(projectId)}
        />
      )}

      {/* Overlays — always on top regardless of view */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          currentUser={currentUser}
          onClose={() => setSelectedProjectId(null)}
          onLike={(id, userId) => likeProject(id, userId)}
          onUnlike={(id, userId) => unlikeProject(id, userId)}
          onComment={(projectId, text, userId, userName) =>
            addComment(projectId, text, userId, userName)
          }
          onAuthorClick={handleAuthorClick}
          onMessageSent={handleMessageSent}
          onSignInRequired={() => setShowLogin(true)}
          onDelete={(id, authorDbId) => {
            deleteProject(id, authorDbId)
            setSelectedProjectId(null)
          }}
        />
      )}

      {uploadOpen && (
        <UploadModal
          existingProjects={projects}
          currentUser={currentUser}
          authToken={authToken}
          onClose={() => setUploadOpen(false)}
          onSubmit={addProject}
        />
      )}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}

      {showProfileSetup && currentUser && authToken && (
        <ProfileSetupModal
          currentUser={currentUser}
          authToken={authToken}
          onComplete={(updatedUser) => {
            setCurrentUser(updatedUser)
            saveAuth(updatedUser, authToken)
            setShowProfileSetup(false)
          }}
          onSkip={() => setShowProfileSetup(false)}
        />
      )}
    </div>
  )
}
