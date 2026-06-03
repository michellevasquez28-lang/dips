import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, authorId, projectId } = req.body
    const comment = await prisma.comment.create({
      data: { text, authorId, projectId },
      include: { author: { select: { name: true } } },
    })
    res.json(comment)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: req.params.projectId },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(comments)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
