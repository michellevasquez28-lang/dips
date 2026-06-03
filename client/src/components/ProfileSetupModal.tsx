import React, { useState, useRef } from 'react'
import { X, Plus, Trash2, Linkedin, Camera } from 'lucide-react'
import { User, WorkExperience } from '../types'
import { api } from '../lib/api'

interface ProfileSetupModalProps {
  currentUser: User
  authToken: string
  onComplete: (updatedUser: User) => void
  onSkip: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const CLASS_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i)

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  currentUser,
  authToken,
  onComplete,
  onSkip,
}) => {
  const [classYear, setClassYear] = useState<string>('')
  const [pronouns, setPronouns] = useState('')
  const [major, setMajor] = useState('')
  const [bio, setBio] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [clubs, setClubs] = useState<string[]>([])
  const [clubInput, setClubInput] = useState('')
  const [workExps, setWorkExps] = useState<WorkExperience[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  const addClub = () => {
    const val = clubInput.trim()
    if (val && !clubs.includes(val)) setClubs((c) => [...c, val])
    setClubInput('')
  }

  const addWork = () =>
    setWorkExps((w) => [...w, { title: '', org: '', years: '' }])

  const updateWork = (i: number, key: keyof WorkExperience, val: string) =>
    setWorkExps((w) => w.map((e, idx) => (idx === i ? { ...e, [key]: val } : e)))

  const removeWork = (i: number) =>
    setWorkExps((w) => w.filter((_, idx) => idx !== i))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classYear) { setError('Class year is required.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('classYear', classYear)
      if (pronouns) fd.append('pronouns', pronouns)
      if (major) fd.append('major', major)
      if (bio) fd.append('bio', bio)
      if (linkedinUrl) fd.append('linkedinUrl', linkedinUrl)
      if (clubs.length) fd.append('clubs', JSON.stringify(clubs))
      if (workExps.filter((w) => w.title || w.org).length)
        fd.append('workExperiences', JSON.stringify(workExps.filter((w) => w.title || w.org)))
      if (photoFile) fd.append('photo', photoFile)

      const updated = await api.updateUser(currentUser.id, fd, authToken)
      onComplete({
        ...currentUser,
        isProfileComplete: true,
        name: updated.name,
      })
    } catch (err: any) {
      setError(err.message ?? 'Could not save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-green-600 transition-shadow'
  const labelClass =
    'block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5'

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between shrink-0"
          style={{ backgroundColor: '#1a6b3a' }}
        >
          <div>
            <h2
              className="text-white text-xl font-bold"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Welcome to DiPs, {currentUser.name.split(' ')[0]}
            </h2>
            <p
              className="text-white/70 text-xs mt-0.5"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
            >
              Tell the community about yourself — all fields optional except class year
            </p>
          </div>
          <button
            onClick={onSkip}
            aria-label="Skip for now"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors ml-4 shrink-0"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Photo + name */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="relative shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-green-600 transition-colors flex items-center justify-center bg-gray-50"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera size={18} className="text-gray-400" />
                  <span className="text-gray-400 text-[9px] leading-tight text-center">Add photo</span>
                </div>
              )}
            </button>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <div className="flex-1">
              <p
                className="font-semibold text-gray-800"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 17 }}
              >
                {currentUser.name}
              </p>
              <p
                className="text-gray-400 text-xs"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
              >
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Class year (required) + pronouns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Class Year <span className="text-green-700">*</span>
              </label>
              <select
                className={inputClass}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                value={classYear}
                onChange={(e) => setClassYear(e.target.value)}
                required
              >
                <option value="">Select year</option>
                {CLASS_YEARS.map((y) => (
                  <option key={y} value={y}>Class of {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Pronouns
              </label>
              <input
                className={inputClass}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                placeholder="she/her, they/them…"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
              />
            </div>
          </div>

          {/* Major */}
          <div>
            <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Major / Concentration
            </label>
            <input
              className={inputClass}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              placeholder="Studio Art, Computer Science…"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Bio
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              rows={3}
              placeholder="A short introduction to your creative practice…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Clubs */}
          <div>
            <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Clubs &amp; Organizations
            </label>
            <div className="flex gap-2 mb-2">
              <input
                className={inputClass}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                placeholder="Add a club or org…"
                value={clubInput}
                onChange={(e) => setClubInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClub() } }}
              />
              <button
                type="button"
                onClick={addClub}
                className="px-3 rounded-lg border border-gray-200 hover:border-green-600 hover:text-green-700 transition-colors shrink-0"
              >
                <Plus size={15} />
              </button>
            </div>
            {clubs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {clubs.map((c) => (
                  <span
                    key={c}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(26,107,58,0.08)',
                      color: '#1a6b3a',
                      border: '1px solid rgba(26,107,58,0.2)',
                      fontFamily: 'Cormorant Garamond, Georgia, serif',
                    }}
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => setClubs((prev) => prev.filter((x) => x !== c))}
                      className="hover:opacity-60 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Work experiences */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                Work &amp; Research Experiences
              </label>
              <button
                type="button"
                onClick={addWork}
                className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 transition-colors"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {workExps.map((w, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                  <input
                    className={inputClass}
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    placeholder="Title / Role"
                    value={w.title}
                    onChange={(e) => updateWork(i, 'title', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    placeholder="Organization"
                    value={w.org}
                    onChange={(e) => updateWork(i, 'org', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeWork(i)}
                    className="mt-0.5 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              LinkedIn
            </label>
            <div className="relative">
              <Linkedin
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className={`${inputClass} pl-9`}
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                placeholder="https://linkedin.com/in/yourname"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p
              className="text-red-500 text-xs text-center"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-1">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 py-2.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-300 transition-all"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileSetupModal
