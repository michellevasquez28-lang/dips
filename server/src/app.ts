import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import projectsRouter from '../routes/projects'
import authRouter from '../routes/auth'
import commentsRouter from '../routes/comments'
import messagesRouter from '../routes/messages'
import usersRouter from '../routes/users'

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

app.use('/api/auth',     authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/users',    usersRouter)

export default app
