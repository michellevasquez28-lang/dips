import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dips-secret-key-dev'

function makeToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}

function userPayload(user: any) {
  const isAdmin =
    user.email === (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim()
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin,
    isProfileComplete: user.isProfileComplete ?? false,
  }
}

// Dartmouth email sign-in: auto-registers on first use
router.post('/dartmouth', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' })

    const normalizedEmail = email.toLowerCase().trim()
    if (!normalizedEmail.endsWith('@dartmouth.edu')) {
      return res.status(403).json({ error: 'Only @dartmouth.edu addresses are allowed.' })
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    const isNewUser = !existing

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { name: name.trim(), email: normalizedEmail, password: '' },
    })

    res.json({
      token: makeToken(user.id),
      user: userPayload(user),
      isNewUser,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
