import React, { useEffect, useState } from 'react'
import {
  ArrowLeft, Linkedin, Heart, ExternalLink, Pencil, X, Plus, Trash2, Camera,
} from 'lucide-react'
import { UserProfile, User, WorkExperience } from '../types'
import { api } from '../lib/api'

interface ProfilePageProps {
  userId: string
  currentUser: User | null
  authToken: string | null
  onBack: () => void
  onProjectClick: (projectId: string) => void
}

// ── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({
  photoUrl,
  initials,
  size = 80,
}: {
  photoUrl?: string | null
  initials: string
  size?: number
}) => (
  <div
    className="rounded-full overflow-hidden shrink-0 flex items-center justify-center font-semibold text-white"
    style={{
      width: size,
      height: size,
      backgroundColor: '#1a6b3a',
      fontSize: size * 0.32,
      fontFamily: 'Cormorant Garamond, Georgia, serif',
    }}
  >
    {photoUrl ? (
      <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
    ) : (
      initials
    )}
  </div>
)

// ── Tag chip ─────────────────────────────────────────────────────────────────
const Chip = ({ label }: { label: string }) => (
  <span
    className="inline-block text-xs px-3 py-1 rounded-full"
    style={{
      backgroundColor: 'rgba(26,107,58,0.08)',
      color: '#1a6b3a',
      border: '1px solid rgba(26,107,58,0.2)',
      fontFamily: 'Cormorant Garamond, Georgia, serif',
    }}
  >
    {label}
  </span>
)

// ── Edit form ─────────────────────────────────────────────────────────────────
const EditPanel = ({
  profile,
  authToken,
  onSaved,
  onCancel,
}: {
  profile: UserProfile
  authToken: string
  onSaved: (updated: UserProfile) => void
  onCancel: () => void
}) => {
  const [classYear, setClassYear] = useState(String(profile.classYear ?? ''))
  const [pronouns, setPronouns] = useState(profile.pronouns ?? '')
  const [major, setMajor] = useState(profile.major ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl ?? '')
  const [clubs, setClubs] = useState<string[]>(profile.clubs ?? [])
  const [clubInput, setClubInput] = useState('')
  const [workExps, setWorkExps] = useState<WorkExperience[]>(profile.workExperiences ?? [])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const photoRef = React.useRef<HTMLInputElement>(null)

  const CURRENT_YEAR = new Date().getFullYear()
  const CLASS_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addClub = () => {
    const val = clubInput.trim()
    if (val && !clubs.includes(val)) setClubs((c) => [...c, val])
    setClubInput('')
  }

  const updateWork = (i: number, key: keyof WorkExperience, val: string) =>
    setWorkExps((w) => w.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)))

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600 transition-shadow'
  const labelClass =
    'block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5'

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      if (classYear) fd.append('classYear', classYear)
      if (pronouns) fd.append('pronouns', pronouns)
      if (major) fd.append('major', major)
      if (bio) fd.append('bio', bio)
      if (linkedinUrl) fd.append('linkedinUrl', linkedinUrl)
      if (clubs.length) fd.append('clubs', JSON.stringify(clubs))
      const validWork = workExps.filter((w) => w.title || w.org)
      if (validWork.length) fd.append('workExperiences', JSON.stringify(validWork))
      if (photoFile) fd.append('photo', photoFile)
      const updated = await api.updateUser(profile.id, fd, authToken)
      onSaved(updated)
    } catch (err: any) {
      setError(err.message ?? 'Save failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="border border-gray-100 rounded-2xl p-6 mt-4 flex flex-col gap-5 bg-gray-50/50"
    >
      <div className="flex items-center justify-between">
        <h3
          className="font-semibold text-gray-800"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 18 }}
        >
          Edit Profile
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-600 transition-colors flex items-center justify-center bg-white"
        >
          {photoPreview || profile.photoUrl ? (
            <img src={photoPreview ?? profile.photoUrl!} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Camera size={16} className="text-gray-400" />
          )}
        </button>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <span
          className="text-xs text-gray-400"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
        >
          Click to update profile photo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Class Year</label>
          <select
            className={inputClass}
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            value={classYear}
            onChange={(e) => setClassYear(e.target.value)}
          >
            <option value="">—</option>
            {CLASS_YEARS.map((y) => <option key={y} value={y}>Class of {y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Pronouns</label>
          <input className={inputClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} placeholder="she/her…" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Major</label>
        <input className={inputClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} value={major} onChange={(e) => setMajor(e.target.value)} />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Bio</label>
        <textarea className={`${inputClass} resize-none`} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Clubs &amp; Organizations</label>
        <div className="flex gap-2 mb-2">
          <input
            className={inputClass}
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            placeholder="Add a club…"
            value={clubInput}
            onChange={(e) => setClubInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClub() } }}
          />
          <button type="button" onClick={addClub} className="px-3 rounded-lg border border-gray-200 hover:border-green-600 transition-colors">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {clubs.map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(26,107,58,0.08)', color: '#1a6b3a', border: '1px solid rgba(26,107,58,0.2)', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {c}
              <button type="button" onClick={() => setClubs((p) => p.filter((x) => x !== c))}><X size={10} /></button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Work &amp; Research</label>
          <button type="button" onClick={() => setWorkExps((w) => [...w, { title: '', org: '', years: '' }])} className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 transition-colors" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
            <Plus size={12} /> Add
          </button>
        </div>
        {workExps.map((w, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2">
            <input className={inputClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} placeholder="Title / Role" value={w.title} onChange={(e) => updateWork(i, 'title', e.target.value)} />
            <input className={inputClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} placeholder="Organization" value={w.org} onChange={(e) => updateWork(i, 'org', e.target.value)} />
            <button type="button" onClick={() => setWorkExps((w) => w.filter((_, idx) => idx !== i))} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      <div>
        <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>LinkedIn</label>
        <div className="relative">
          <Linkedin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className={`${inputClass} pl-9`} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }} placeholder="https://linkedin.com/in/…" type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs text-center" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-300 transition-all" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2" style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
const ProfilePage: React.FC<ProfilePageProps> = ({
  userId,
  currentUser,
  authToken,
  onBack,
  onProjectClick,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    setLoading(true)
    setEditOpen(false)
    api
      .getUser(userId, authToken)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white gap-4">
        <p
          className="text-gray-400 text-lg"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
        >
          Profile not found.
        </p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          <ArrowLeft size={15} /> Back to gallery
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Top bar */}
      <div
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-3 flex items-center gap-4"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
        >
          <ArrowLeft size={15} /> Gallery
        </button>
        <div className="flex-1" />
        <img src="/logo.png" alt="DiPs" style={{ height: 28, width: 'auto', opacity: 0.7 }} />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-10">

          {/* Left: profile info */}
          <div className="md:w-64 shrink-0 flex flex-col gap-5">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center md:items-start md:text-left gap-3">
              <Avatar photoUrl={profile.photoUrl} initials={profile.initials} size={88} />
              <div>
                <h1
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: 28,
                    color: '#1a1a1a',
                  }}
                >
                  {profile.name}
                </h1>
                {profile.pronouns && (
                  <p
                    className="text-gray-400 text-sm mt-0.5"
                    style={{
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                      fontStyle: 'italic',
                    }}
                  >
                    {profile.pronouns}
                  </p>
                )}
                {(profile.classYear || profile.major) && (
                  <p
                    className="text-gray-500 text-sm mt-1"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {[profile.major, profile.classYear ? `Class of ${profile.classYear}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p
                className="text-gray-600 text-sm leading-relaxed"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {profile.bio}
              </p>
            )}

            {/* LinkedIn */}
            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#0a66c2] hover:underline transition-opacity hover:opacity-80"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                <Linkedin size={14} />
                LinkedIn profile
                <ExternalLink size={11} className="opacity-60" />
              </a>
            )}

            {/* Clubs */}
            {profile.clubs.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Clubs &amp; Organizations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.clubs.map((c) => <Chip key={c} label={c} />)}
                </div>
              </div>
            )}

            {/* Work experiences */}
            {profile.workExperiences.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Experience
                </p>
                <div className="flex flex-col gap-2">
                  {profile.workExperiences.map((w, i) => (
                    <div key={i}>
                      {w.title && (
                        <p
                          className="text-sm font-semibold text-gray-800 leading-tight"
                          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                        >
                          {w.title}
                        </p>
                      )}
                      {w.org && (
                        <p
                          className="text-xs text-gray-500"
                          style={{
                            fontFamily: 'Cormorant Garamond, Georgia, serif',
                            fontStyle: 'italic',
                          }}
                        >
                          {w.org}
                          {w.years ? ` · ${w.years}` : ''}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Edit button (own profile) */}
            {isOwnProfile && !editOpen && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-1"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                <Pencil size={13} />
                Edit profile
              </button>
            )}
          </div>

          {/* Right: works grid + optional edit panel */}
          <div className="flex-1 min-w-0">
            {/* Edit panel */}
            {isOwnProfile && editOpen && authToken && (
              <EditPanel
                profile={profile}
                authToken={authToken}
                onSaved={(updated) => { setProfile(updated); setEditOpen(false) }}
                onCancel={() => setEditOpen(false)}
              />
            )}

            {/* Works header */}
            <div className="flex items-baseline gap-3 mb-5 mt-2">
              <h2
                className="font-semibold"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 22,
                  color: '#1a1a1a',
                }}
              >
                Works
              </h2>
              <span
                className="text-gray-400 text-sm"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontStyle: 'italic',
                }}
              >
                {profile.projects.length} {profile.projects.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            {profile.projects.length === 0 ? (
              <p
                className="text-gray-400 text-sm"
                style={{
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontStyle: 'italic',
                }}
              >
                No works in the gallery yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {profile.projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onProjectClick(p.id)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-200"
                    style={{ background: p.imageUrl ? undefined : p.gradient }}
                    aria-label={`Open ${p.title}`}
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {!p.imageUrl && (
                      <div className="absolute inset-0" style={{ background: p.gradient }} />
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 px-2">
                      <p
                        className="text-white text-center font-semibold leading-tight text-sm"
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                      >
                        {p.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-white/80 text-xs">
                        <Heart size={11} />
                        {p.likes}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
