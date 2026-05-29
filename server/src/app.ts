import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import projectsRouter from '../routes/projects'
import authRouter from '../routes/auth'
import commentsRouter from '../routes/comments'
import messagesRouter from '../routes/messages'

dotenv.config()

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth',     authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/messages', messagesRouter)

export default app
