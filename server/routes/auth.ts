import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dips-secret-key-dev'
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ''

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

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

// ── Google OAuth ────────────────────────────────────────────────────────────
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'No credential provided.' })

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload?.email) return res.status(400).json({ error: 'Invalid Google token.' })

    const email = payload.email.toLowerCase()
    if (!email.endsWith('@dartmouth.edu')) {
      return res.status(403).json({ error: 'Only @dartmouth.edu accounts are allowed.' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    const isNewUser = !existing

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: payload.name ?? email.split('@')[0],
        email,
        password: '',
      },
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

// ── Dartmouth email sign-in (fallback / demo) ───────────────────────────────
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
