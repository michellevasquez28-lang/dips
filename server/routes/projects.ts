import { Router, Request, Response } from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import {
  projects, comments, likes,
  findUserById,
  StoredProject,
} from '../src/store'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

function formatProject(p: StoredProject) {
  const author = findUserById(p.authorId)
  const authorName = author?.name ?? 'Unknown'
  const initials = authorName
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const projectComments = comments
    .filter((c) => c.projectId === p.id)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((c) => {
      const cAuthor = findUserById(c.authorId)
      const cName = cAuthor?.name ?? 'Anonymous'
      return {
        id: c.id,
        text: c.text,
        authorName: cName,
        authorInitials: cName
          .split(' ')
          .map((n: string) => n[0] ?? '')
          .join('')
          .toUpperCase()
          .slice(0, 2),
        createdAt: c.createdAt.toISOString().split('T')[0],
      }
    })

  const projectLikes = likes.filter((l) => l.projectId === p.id)

  return {
    id: p.id,
    title: p.title,
    author: authorName,
    authorInitials: initials,
    authorEmail: author?.email ?? null,
    authorDbId: p.authorId,
    department: p.department,
    projectType: p.projectType,
    classCode: p.classCode ?? null,
    description: p.description,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
    imageUrl: p.imageUrl ?? null,
    pdfUrl: p.pdfUrl ?? null,
    gradient: p.gradient,
    likes: projectLikes.length,
    comments: projectComments,
    year: p.year,
    frameData: typeof p.frameData === 'string' ? JSON.parse(p.frameData) : p.frameData,
    createdAt: p.createdAt,
  }
}

// GET all projects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sorted = [...projects].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    res.json(sorted.map(formatProject))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = projects.find((p) => p.id === req.params.id)
    if (!project) return res.status(404).json({ error: 'Not found' })
    res.json(formatProject(project))
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create project (multipart: image + pdf fields)
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const {
        title, description, tags, department, projectType,
        classCode, year, gradient, frameData, authorId,
      } = req.body

      const files = req.files as {
        image?: Express.Multer.File[]
        pdf?: Express.Multer.File[]
      }

      const imageUrl = files.image?.[0]
        ? `data:${files.image[0].mimetype};base64,${files.image[0].buffer.toString('base64')}`
        : null
      const pdfUrl = files.pdf?.[0]
        ? `data:application/pdf;base64,${files.pdf[0].buffer.toString('base64')}`
        : null

      const project: StoredProject = {
        id: uuidv4(),
        title,
        description,
        tags,
        department,
        projectType,
        classCode: classCode || null,
        year: parseInt(year),
        gradient,
        frameData,
        imageUrl,
        pdfUrl,
        authorId,
        createdAt: new Date(),
      }
      projects.push(project)

      res.json(formatProject(project))
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Server error' })
    }
  }
)

// DELETE project (only by author or admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { authorId: requesterId } = req.body
    const idx = projects.findIndex((p) => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })

    const project = projects[idx]
    const isOwner = project.authorId === requesterId
    let isAdmin = false
    if (!isOwner) {
      const adminEmail = (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim()
      if (adminEmail) {
        const requester = findUserById(requesterId)
        isAdmin = requester?.email === adminEmail
      }
    }
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' })

    projects.splice(idx, 1)
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].projectId === req.params.id) comments.splice(i, 1)
    }
    for (let i = likes.length - 1; i >= 0; i--) {
      if (likes[i].projectId === req.params.id) likes.splice(i, 1)
    }

    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST toggle like
router.post('/:id/like', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body
    const existingIdx = likes.findIndex(
      (l) => l.userId === userId && l.projectId === req.params.id
    )
    if (existingIdx !== -1) {
      likes.splice(existingIdx, 1)
      return res.json({ liked: false })
    }
    likes.push({ id: uuidv4(), userId, projectId: req.params.id })
    res.json({ liked: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
