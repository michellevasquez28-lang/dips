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
  slides?: string[]
  gradient: string
  authorEmail?: string
  authorDbId?: string
  likes: number
  comments: Comment[]
  year: number
  frameData: FrameData
}

export interface FrameData {
  x: number
  y: number
  rotation: number
  frameIndex: number
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
  correspondentId?: string
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
  isProfileComplete?: boolean
}

export interface WorkExperience {
  title: string
  org: string
  years: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  initials: string
  pronouns: string | null
  bio: string | null
  classYear: number | null
  major: string | null
  photoUrl: string | null
  clubs: string[]
  workExperiences: WorkExperience[]
  linkedinUrl: string | null
  isProfileComplete: boolean
  projects: {
    id: string
    title: string
    department: string
    projectType: string
    classCode: string | null
    year: number
    imageUrl: string | null
    gradient: string
    likes: number
    tags: string[]
    frameData: FrameData
  }[]
}

export interface CanvasTransform {
  x: number
  y: number
  scale: number
}
