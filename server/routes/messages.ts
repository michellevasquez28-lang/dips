import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { messages, findUserById, StoredMessage } from '../src/store'

const router = Router()

function formatMsg(m: StoredMessage, direction: 'sent' | 'received') {
  const fromUser = findUserById(m.fromId)
  const toUser = findUserById(m.toId)
  return {
    id: m.id,
    subject: m.subject ?? '',
    body: m.body,
    sentAt: new Date(m.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    direction,
    correspondent: direction === 'sent' ? toUser?.name ?? 'Unknown' : fromUser?.name ?? 'Unknown',
    correspondentId: direction === 'sent' ? m.toId : m.fromId,
  }
}

// POST /api/messages — send a message
router.post('/', async (req: Request, res: Response) => {
  try {
    const { subject, body, fromId, toId } = req.body
    if (!fromId || !toId || !body) {
      return res.status(400).json({ error: 'fromId, toId, and body are required' })
    }
    const message: StoredMessage = {
      id: uuidv4(),
      subject: subject ?? '',
      body,
      fromId,
      toId,
      createdAt: new Date(),
    }
    messages.push(message)
    res.json(formatMsg(message, 'sent'))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/messages/user/:userId — all sent + received, newest first
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId
    const all = messages
      .filter((m) => m.fromId === userId || m.toId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((m) => formatMsg(m, m.fromId === userId ? 'sent' : 'received'))
    res.json(all)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/messages/thread/:userId/:otherUserId — full conversation, oldest first
router.get('/thread/:userId/:otherUserId', async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params
    const thread = messages
      .filter(
        (m) =>
          (m.fromId === userId && m.toId === otherUserId) ||
          (m.fromId === otherUserId && m.toId === userId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((m) => formatMsg(m, m.fromId === userId ? 'sent' : 'received'))
    res.json(thread)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Legacy inbox endpoint
router.get('/inbox/:userId', async (req: Request, res: Response) => {
  try {
    const received = messages
      .filter((m) => m.toId === req.params.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((m) => formatMsg(m, 'received'))
    res.json(received)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
