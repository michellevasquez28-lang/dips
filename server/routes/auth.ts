import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dips-secret-key-dev'
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Google Sign-In: verify Google ID token, enforce @dartmouth.edu, auto-register.
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'Missing credential.' })

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    if (!payload) return res.status(400).json({ error: 'Invalid Google token.' })

    const email = payload.email?.toLowerCase()
    const name = payload.name ?? email?.split('@')[0] ?? 'Dartmouth User'

    if (!email?.endsWith('@dartmouth.edu')) {
      return res.status(403).json({ error: 'Only @dartmouth.edu accounts are allowed.' })
    }

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { name, email, password: '' } })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
