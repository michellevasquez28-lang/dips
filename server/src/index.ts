import express from 'express'
import cors from 'cors'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import projectsRouter from '../routes/projects'
import authRouter from '../routes/auth'
import commentsRouter from '../routes/comments'
import messagesRouter from '../routes/messages'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true },
})

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth',     authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/messages', messagesRouter)

io.on('connection', (socket) => {
  socket.on('join-project', (projectId: string) => socket.join(`project:${projectId}`))
  socket.on('leave-project', (projectId: string) => socket.leave(`project:${projectId}`))
})

export { io }

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`DiPs server running on port ${PORT}`))
