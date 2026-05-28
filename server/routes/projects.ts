import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const prisma = new PrismaClient()

const UPLOADS_DIR = path.join(__dirname, '../uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
})

// Helper: transform Prisma project to the shape the frontend expects
function formatProject(p: any) {
  const authorName: string = p.author?.name ?? 'Unknown'
  const initials = authorName
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    id: p.id,
    title: p.title,
    author: authorName,
    authorInitials: initials,
    authorEmail: p.author?.email ?? null,
    authorDbId: p.authorId,
    department: p.department,
    projectType: p.projectType,
    classCode: p.classCode ?? null,
    description: p.description,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
    imageUrl: p.imageUrl ?? null,
    pdfUrl: p.pdfUrl ?? null,
    gradient: p.gradient,
    likes: p.likes?.length ?? 0,
    comments: (p.comments ?? []).map((c: any) => {
      const cName: string = c.author?.name ?? 'Anonymous'
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
        createdAt: c.createdAt
          ? new Date(c.createdAt).toISOString().split('T')[0]
          : '',
      }
    }),
    year: p.year,
    frameData:
      typeof p.frameData === 'string' ? JSON.parse(p.frameData) : p.frameData,
    createdAt: p.createdAt,
  }
}

const FULL_INCLUDE = {
  author: { select: { id: true, name: true, email: true } },
  comments: {
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  likes: true,
}

// GET all projects
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: FULL_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects.map(formatProject))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: FULL_INCLUDE,
    })
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
        title,
        description,
        tags,
        department,
        projectType,
        classCode,
        year,
        gradient,
        frameData,
        authorId,
      } = req.body

      const files = req.files as {
        image?: Express.Multer.File[]
        pdf?: Express.Multer.File[]
      }

      const imageUrl = files.image?.[0]
        ? `/uploads/${files.image[0].filename}`
        : undefined
      const pdfUrl = files.pdf?.[0]
        ? `/uploads/${files.pdf[0].filename}`
        : undefined

      const project = await prisma.project.create({
        data: {
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
        },
        include: FULL_INCLUDE,
      })

      res.json(formatProject(project))
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Server error' })
    }
  }
)

// DELETE project (only by author)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { authorId } = req.body
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) return res.status(404).json({ error: 'Not found' })
    if (project.authorId !== authorId) return res.status(403).json({ error: 'Forbidden' })

    // Clean up uploaded files
    if (project.imageUrl) {
      const p = path.join(UPLOADS_DIR, path.basename(project.imageUrl))
      if (fs.existsSync(p)) fs.unlinkSync(p)
    }
    if (project.pdfUrl) {
      const p = path.join(UPLOADS_DIR, path.basename(project.pdfUrl))
      if (fs.existsSync(p)) fs.unlinkSync(p)
    }

    await prisma.like.deleteMany({ where: { projectId: req.params.id } })
    await prisma.comment.deleteMany({ where: { projectId: req.params.id } })
    await prisma.project.delete({ where: { id: req.params.id } })

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
    const existing = await prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId: req.params.id } },
    })
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } })
      return res.json({ liked: false })
    }
    await prisma.like.create({ data: { userId, projectId: req.params.id } })
    res.json({ liked: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
