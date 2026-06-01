export interface Comment {
  id: string
  text: string
  authorName: string
  authorInitials: string
  createdAt: string
}

export interface Project {
  id: string
  title: string
  author: string
  authorInitials: string
  department: string
  projectType: 'Solo' | 'Group' | 'Class Project' | 'Independent'
  classCode?: string
  description: string
  tags: string[]
  imageUrl?: string
  pdfUrl?: string
  gradient: string
  authorEmail?: string
  authorDbId?: string   // DB primary key, used for delete/ownership checks
  likes: number
  comments: Comment[]
  year: number
  frameData: FrameData
}

export interface FrameData {
  x: number
  y: number
  rotation: number
  frameIndex: number   // 1–18, references /frames/frame-N.png
  bobDelay: number
}

export interface FilterState {
  departments: string[]
  projectTypes: string[]
  tags: string[]
  years: number[]
}

export interface Message {
  id: string
  correspondent: string
  correspondentId: string   // DB id of the other party, used to open thread
  subject: string
  body: string
  sentAt: string
  direction: 'sent' | 'received'
}

export interface User {
  id: string
  name: string
  email: string
  initials: string
  isAdmin?: boolean
}

export interface CanvasTransform {
  x: number
  y: number
  scale: number
}
