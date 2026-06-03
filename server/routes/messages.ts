import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

function formatMsg(m: any, direction: 'sent' | 'received') {
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
    correspondent: direction === 'sent' ? m.to?.name ?? 'Unknown' : m.from?.name ?? 'Unknown',
    correspondentId: direction === 'sent' ? m.toId : m.fromId,
  }
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { subject, body, fromId, toId } = req.body
    if (!fromId || !toId || !body)
      return res.status(400).json({ error: 'fromId, toId, and body are required' })
    const message = await prisma.message.create({
      data: { subject: subject ?? '', body, fromId, toId },
      include: { to: { select: { name: true } }, from: { select: { name: true } } },
    })
    res.json(formatMsg(message, 'sent'))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId
    const [sent, received] = await Promise.all([
      prisma.message.findMany({
        where: { fromId: userId },
        include: { to: { select: { name: true } }, from: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.message.findMany({
        where: { toId: userId },
        include: { to: { select: { name: true } }, from: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    const all = [
      ...sent.map((m) => ({ ...m, _dir: 'sent' as const })),
      ...received.map((m) => ({ ...m, _dir: 'received' as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((m) => formatMsg(m, m._dir))
    res.json(all)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/thread/:userId/:otherUserId', async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.params
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: userId, toId: otherUserId },
          { fromId: otherUserId, toId: userId },
        ],
      },
      include: { to: { select: { name: true } }, from: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(messages.map((m) => formatMsg(m, m.fromId === userId ? 'sent' : 'received')))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/inbox/:userId', async (req: Request, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { toId: req.params.userId },
      include: { from: { select: { name: true } }, to: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(messages.map((m) => formatMsg(m, 'received')))
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
