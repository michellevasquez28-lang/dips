import { Router, Request, Response } from 'express'
import multer from 'multer'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB for profile photos
})

// Format a full user profile for the frontend
function formatProfile(user: any) {
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials,
    pronouns: user.pronouns ?? null,
    bio: user.bio ?? null,
    classYear: user.classYear ?? null,
    major: user.major ?? null,
    photoUrl: user.photoUrl ?? null,
    clubs: user.clubs ? JSON.parse(user.clubs) : [],
    workExperiences: user.workExperiences ? JSON.parse(user.workExperiences) : [],
    linkedinUrl: user.linkedinUrl ?? null,
    isProfileComplete: user.isProfileComplete,
    projects: (user.projects ?? []).map((p: any) => ({
      id: p.id,
      title: p.title,
      department: p.department,
      projectType: p.projectType,
      classCode: p.classCode ?? null,
      year: p.year,
      imageUrl: p.imageUrl ?? null,
      gradient: p.gradient,
      likes: p.likes?.length ?? 0,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags,
      frameData:
        typeof p.frameData === 'string' ? JSON.parse(p.frameData) : p.frameData,
    })),
  }
}

// GET /api/users/:id  — public profile + their projects
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        projects: {
          include: { likes: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    if (!user) return res.status(404).json({ error: 'Not found' })
    res.json(formatProfile(user))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /api/users/:id  — update profile (with optional photo upload)
router.patch('/:id', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const { name, pronouns, bio, classYear, major, clubs, workExperiences, linkedinUrl } =
      req.body

    const photoUrl = req.file
      ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
      : undefined

    const data: any = {
      ...(name?.trim() ? { name: name.trim() } : {}),
      pronouns: pronouns || null,
      bio: bio || null,
      classYear: classYear ? parseInt(classYear) : null,
      major: major || null,
      clubs: clubs || null,
      workExperiences: workExperiences || null,
      linkedinUrl: linkedinUrl || null,
      isProfileComplete: true,
    }
    if (photoUrl !== undefined) data.photoUrl = photoUrl

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      include: {
        projects: {
          include: { likes: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    res.json(formatProfile(user))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
