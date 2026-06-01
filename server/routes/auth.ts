import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dips-secret-key-dev'

// Dartmouth sign-in: name + @dartmouth.edu email, auto-register on first use
router.post('/dartmouth', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' })

    const normalizedEmail = email.toLowerCase().trim()
    if (!normalizedEmail.endsWith('@dartmouth.edu')) {
      return res.status(403).json({ error: 'Only @dartmouth.edu addresses are allowed.' })
    }

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      user = await prisma.user.create({
        data: { name: name.trim(), email: normalizedEmail, password: '' },
      })
    }

    const isAdmin = normalizedEmail === (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim()
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
