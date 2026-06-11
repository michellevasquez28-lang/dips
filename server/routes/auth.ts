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
  const isAdmin = user.email === (process.env.ADMIN_EMAIL ?? '').toLowerCase().trim()
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin,
    isProfileComplete: user.isProfileComplete ?? false,
  }
}

// Dartmouth email sign-in — no name required for returning users.
// New users get a temp name from the email prefix; they set their real
// name in the ProfileSetupModal that appears on first login.
router.post('/dartmouth', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required.' })

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    const isNewUser = !existing

    // For new users use provided name, then email prefix as fallback
    const newName = (name?.trim()) || normalizedEmail.split('@')[0]

    const user = await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {},  // never overwrite existing user's name on re-login
      create: { name: newName, email: normalizedEmail, password: '' },
    })

    res.json({ token: makeToken(user.id), user: userPayload(user), isNewUser })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
