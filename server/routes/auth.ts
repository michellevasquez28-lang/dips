import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dips-secret-key-dev'

// Dartmouth single-sign-on simulation: auto-register/login with @dartmouth.edu email only.
// No password — relies on email domain validation as the trust mechanism (demo/prototype).
router.post('/dartmouth', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Name and email are required.' })
    }
    if (!email.trim().toLowerCase().endsWith('@dartmouth.edu')) {
      return res.status(400).json({ error: 'Must use a @dartmouth.edu email address.' })
    }

    const normalEmail = email.trim().toLowerCase()

    let user = await prisma.user.findUnique({ where: { email: normalEmail } })
    if (!user) {
      user = await prisma.user.create({
        data: { name: name.trim(), email: normalEmail, password: '' },
      })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
