import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { comments, findUserById } from '../src/store'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, authorId, projectId } = req.body
    const comment = { id: uuidv4(), text, authorId, projectId, createdAt: new Date() }
    comments.push(comment)
    const author = findUserById(authorId)
    res.json({ ...comment, author: { name: author?.name ?? 'Anonymous' } })
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const result = comments
      .filter((c) => c.projectId === req.params.projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((c) => {
        const author = findUserById(c.authorId)
        return { ...c, author: { name: author?.name ?? 'Anonymous' } }
      })
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
