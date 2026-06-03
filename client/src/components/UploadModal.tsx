import React, { useState, useRef } from 'react'
import { X, Check, FileText } from 'lucide-react'
import { pdfjs as pdfjsLib } from '../lib/pdfSetup'
import { Project, User } from '../types'
import { FRAME_DATA, FRAME_SCALE } from './Frame'
import { api } from '../lib/api'
import { apiToProject } from '../hooks/useProjects'

interface UploadModalProps {
  existingProjects: Project[]
  currentUser: User | null
  authToken: string | null
  onClose: () => void
  onSubmit: (project: Project) => void
}

const GRADIENTS = [
  'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #96fbc4 100%)',
  'linear-gradient(160deg, #780000 0%, #c1121f 35%, #e09f3e 65%, #fff3b0 100%)',
  'linear-gradient(150deg, #023e8a 0%, #0077b6 30%, #00b4d8 60%, #90e0ef 100%)',
  'linear-gradient(135deg, #4a0080 0%, #7b2d8b 30%, #c471f5 65%, #fa71cd 100%)',
  'linear-gradient(130deg, #f8961e 0%, #f9c74f 40%, #90be6d 70%, #43aa8b 100%)',
  'linear-gradient(135deg, #1e3a5f 0%, #2e86ab 35%, #a4def9 65%, #e8f4f8 100%)',
]

const DEPARTMENTS = [
  'Studio Art', 'Computer Science', 'Engineering', 'Film Studies',
  'Environmental Science', 'Theater', 'Music', 'Other',
]

const ALL_FRAME_INDICES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function getRenderedSize(frameIndex: number) {
  const fd = FRAME_DATA[frameIndex]
  const scale = FRAME_SCALE[frameIndex] ?? 2.0
  return { W: Math.round(fd.w * scale), H: Math.round(fd.h * scale) }
}

function findNonOverlappingPosition(
  existing: Project[],
  frameIndex: number,
  canvasW = 2600,
  canvasH = 1800,
  padding = 90,
): { x: number; y: number } {
  const { W, H } = getRenderedSize(frameIndex)

  const boxes = existing.map((p) => {
    const { W: w, H: h } = getRenderedSize(p.frameData.frameIndex)
    return {
      left:   p.frameData.x - padding,
      top:    p.frameData.y - padding,
      right:  p.frameData.x + w + padding,
      bottom: p.frameData.y + h + padding,
    }
  })

  const overlaps = (x: number, y: number) =>
    boxes.some((b) => x + W > b.left && x < b.right && y + H > b.top && y < b.bottom)

  for (let attempt = 0; attempt < 300; attempt++) {
    const x = padding + Math.random() * (canvasW - W - padding * 2)
    const y = padding + Math.random() * (canvasH - H - padding * 2)
    if (!overlaps(x, y)) return { x: Math.round(x), y: Math.round(y) }
  }

  const maxBottom = existing.reduce((max, p) => {
    const { H: h } = getRenderedSize(p.frameData.frameIndex)
    return Math.max(max, p.frameData.y + h)
  }, 0)
  return { x: padding, y: maxBottom + padding }
}

async function renderPDFFirstPage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale: 2.0 })
  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  await page.render({ canvas, canvasContext: ctx, viewport }).promise
  return canvas.toDataURL('image/jpeg', 0.9)
}

// Renders the PDF first page into a canvas that matches the frame opening's aspect ratio.
// The page is scaled to fit (contain) with a white background, so there's no cropping.
async function renderPDFForFrame(file: File, frameIndex: number): Promise<string> {
  const fd = FRAME_DATA[frameIndex]
  if (!fd) return renderPDFFirstPage(file)

  const aspect = fd.ow / fd.oh
  const longSide = 700
  const targetW = aspect >= 1 ? longSide : Math.round(longSide * aspect)
  const targetH = aspect >= 1 ? Math.round(longSide / aspect) : longSide

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
  const page = await pdf.getPage(1)
  const nat = page.getViewport({ scale: 1 })
  const fitScale = Math.min(targetW / nat.width, targetH / nat.height)
  const vp = page.getViewport({ scale: fitScale })

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetW, targetH)
  ctx.save()
  ctx.translate(Math.round((targetW - vp.width) / 2), Math.round((targetH - vp.height) / 2))
  await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise
  ctx.restore()

  return canvas.toDataURL('image/jpeg', 0.9)
}

type Step = 1 | 2 | 3

const StepIndicator = ({ current }: { current: Step }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {([1, 2, 3] as Step[]).map((step) => (
      <React.Fragment key={step}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={{
            backgroundColor: current >= step ? '#1a6b3a' : '#e5e7eb',
            color: current >= step ? 'white' : '#9ca3af',
            fontFamily: 'Cormorant Garamond, Georgia, serif',
          }}
        >
          {current > step ? <Check size={12} /> : step}
        </div>
        {step < 3 && (
          <div
            className="h-0.5 w-8 transition-all"
            style={{ backgroundColor: current > step ? '#1a6b3a' : '#e5e7eb' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
)

const UploadModal: React.FC<UploadModalProps> = ({ existingProjects, currentUser, authToken, onClose, onSubmit }) => {
  const [step, setStep] = useState<Step>(1)

  // Step 1 fields — pre-fill name from logged-in user
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState(currentUser?.name ?? '')
  const [department, setDepartment] = useState('')
  const [classCode, setClassCode] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  // Step 2 fields
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfPreviewImage, setPdfPreviewImage] = useState<string | null>(null)
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isRendering, setIsRendering] = useState(false)
  const [renderError, setRenderError] = useState(false)

  // Assigned on reaching step 3
  const [assignedFrame, setAssignedFrame] = useState<number>(12)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  const handlePDF = async (file: File) => {
    if (file.type !== 'application/pdf') return
    setPdfFile(file)
    setRenderError(false)
    const objectUrl = URL.createObjectURL(file)
    setPdfUrl(objectUrl)
    setIsRendering(true)
    try {
      const img = await renderPDFFirstPage(file)
      setPdfPreviewImage(img)
    } catch (err) {
      console.error('PDF render error:', err)
      setRenderError(true)
    } finally {
      setIsRendering(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePDF(file)
  }

  const handleContinue = async () => {
    if (step === 2) {
      const idx = ALL_FRAME_INDICES[Math.floor(Math.random() * ALL_FRAME_INDICES.length)]
      setAssignedFrame(idx)
      if (pdfFile && !renderError) {
        setIsRendering(true)
        try {
          const thumb = await renderPDFForFrame(pdfFile, idx)
          setPdfPreviewImage(thumb)
        } catch (e) {
          console.error('Frame thumbnail render error:', e)
        } finally {
          setIsRendering(false)
        }
      }
    }
    setStep((s) => (s + 1) as Step)
  }

  const handleSubmit = async () => {
    if (!currentUser || !authToken) {
      setUploadError('You must be signed in to upload.')
      return
    }
    setIsUploading(true)
    setUploadError(null)

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const { x, y } = findNonOverlappingPosition(existingProjects, assignedFrame)
    const rotation = (Math.random() - 0.5) * 12

    const frameDataJson = JSON.stringify({
      x, y, rotation,
      frameIndex: assignedFrame,
      bobDelay: Math.random() * 4,
    })

    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('authorId', currentUser.id)
      formData.append('department', department || 'Studio Art')
      formData.append('projectType', classCode ? 'Class Project' : 'Solo')
      if (classCode) formData.append('classCode', classCode)
      formData.append('description', description)
      formData.append('tags', JSON.stringify(tags))
      formData.append('gradient', selectedGradient)
      formData.append('year', String(new Date().getFullYear()))
      formData.append('frameData', frameDataJson)

      // Attach PDF file
      if (pdfFile) formData.append('pdf', pdfFile)

      // Convert thumbnail data URL → Blob and attach as image
      if (pdfPreviewImage) {
        const res2 = await fetch(pdfPreviewImage)
        const blob = await res2.blob()
        formData.append('image', blob, 'thumbnail.jpg')
      }

      const raw = await api.createProject(formData, authToken)
      const project = apiToProject(raw)
      onSubmit(project)
      onClose()
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const canProceed: boolean = [
    !!(title.trim() && author.trim() && department && description.trim()),
    !!(pdfFile),
    true,
  ][step - 1]

  const stepLabels = ['Project basics', 'Upload your work', 'Preview & confirm']

  const inputClass = `w-full px-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 text-sm border border-gray-200
    focus:outline-none focus:ring-1 transition-shadow`
  const labelClass = `block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
            >
              Upload Your Work
            </h2>
            <p
              className="text-xs text-gray-400"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
            >
              {stepLabels[step - 1]}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload modal"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <StepIndicator current={step} />

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Title *</label>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Project title"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  Your Name *
                  {currentUser && (
                    <span className="ml-2 normal-case font-normal text-green-700" style={{ fontStyle: 'italic' }}>
                      (from your account)
                    </span>
                  )}
                </label>
                <input
                  className={inputClass}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Full name"
                  readOnly={!!currentUser}
                  style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    backgroundColor: currentUser ? '#f0fdf4' : undefined,
                    color: currentUser ? '#166534' : undefined,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Department *</label>
                  <select
                    className={inputClass}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    <option value="">Select...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Class Code</label>
                  <input
                    className={inputClass}
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="e.g. ENGS 15.15"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Description *</label>
                <textarea
                  className={inputClass}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', resize: 'none' }}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Tags (comma-separated)</label>
                <input
                  className={inputClass}
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="art, design, sustainability..."
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                />
              </div>
            </div>
          )}

          {/* Step 2: PDF upload */}
          {step === 2 && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileRef.current?.click()}
                role="button"
                aria-label="Upload PDF by clicking or dragging"
              >
                {isRendering ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      Rendering preview…
                    </p>
                  </div>
                ) : pdfFile && !renderError ? (
                  <div className="flex flex-col items-center gap-3">
                    {pdfPreviewImage ? (
                      <img
                        src={pdfPreviewImage}
                        alt="PDF first page preview"
                        className="mx-auto max-h-48 rounded-lg shadow-md object-contain"
                      />
                    ) : (
                      <FileText size={36} className="text-gray-300" />
                    )}
                    <p className="text-gray-500 text-sm" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      <span className="font-semibold">{pdfFile?.name}</span>
                      <span className="text-gray-400 ml-2">— click to replace</span>
                    </p>
                  </div>
                ) : renderError ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={28} className="text-red-300" />
                    <p className="text-red-400 text-sm" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      Could not preview — the PDF will still be uploaded.
                    </p>
                    <p className="text-gray-400 text-xs" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      {pdfFile?.name} — click to replace
                    </p>
                  </div>
                ) : (
                  <>
                    <FileText size={28} className="mx-auto mb-2 text-gray-300" />
                    <p
                      className="text-gray-400 text-sm"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-xs text-gray-300 mt-1">PDF only — up to 50 MB</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePDF(e.target.files[0])}
              />

              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Fallback color (if preview unavailable)
                </p>
                <div className="flex gap-2 flex-wrap">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGradient(g)}
                      className="w-10 h-10 rounded-lg transition-all hover:scale-110"
                      style={{
                        background: g,
                        outline: selectedGradient === g ? '2.5px solid #1a6b3a' : 'none',
                        outlineOffset: 2,
                      }}
                      aria-label="Select fallback color"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <div className="text-center">
              <div
                className="mx-auto rounded-xl overflow-hidden mb-4 shadow-md bg-white"
                style={{ width: 240, height: 180 }}
              >
                {pdfPreviewImage ? (
                  <img src={pdfPreviewImage} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full" style={{ background: selectedGradient }} />
                )}
              </div>
              <h3
                className="text-xl font-bold mb-1"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#1a1a1a' }}
              >
                {title}
              </h3>
              <p
                className="text-gray-500 text-sm mb-1"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
              >
                {author} · {department}
              </p>
              {classCode && (
                <p
                  className="text-gray-400 text-xs mb-2"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  {classCode}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {tagsInput.split(',').filter(Boolean).map((t) => (
                  <span
                    key={t.trim()}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    #{t.trim()}
                  </span>
                ))}
              </div>
              <p
                className="text-xs text-gray-400"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontStyle: 'italic' }}
              >
                A frame will be randomly assigned when posted.
              </p>
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <p className="text-red-500 text-xs mt-4 text-center" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              {uploadError}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-4">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleContinue}
                disabled={!canProceed || isRendering}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {isRendering && step === 2 && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isRendering && step === 2 ? 'Preparing…' : 'Continue'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isUploading}
                className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1a6b3a', fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                {isUploading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isUploading ? 'Uploading…' : 'Add to Gallery'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
