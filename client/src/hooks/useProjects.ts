import { useState, useCallback, useEffect } from 'react'
import { Project, FilterState, Comment } from '../types'
import { api } from '../lib/api'

const EMPTY_FILTERS: FilterState = {
  departments: [],
  projectTypes: [],
  tags: [],
  years: [],
}

// Transform the API response shape into the frontend Project type
export function apiToProject(p: any): Project {
  const authorName: string = p.author ?? 'Unknown'
  return {
    id: p.id,
    title: p.title,
    author: authorName,
    authorInitials: p.authorInitials ?? authorName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    authorEmail: p.authorEmail ?? undefined,
    authorDbId: p.authorDbId ?? undefined,
    department: p.department,
    projectType: p.projectType as any,
    classCode: p.classCode ?? undefined,
    description: p.description,
    tags: Array.isArray(p.tags) ? p.tags : JSON.parse(p.tags || '[]'),
    imageUrl: p.imageUrl ?? undefined,
    pdfUrl: p.pdfUrl ?? undefined,
    gradient: p.gradient,
    likes: typeof p.likes === 'number' ? p.likes : (p.likes?.length ?? 0),
    comments: Array.isArray(p.comments) ? p.comments : [],
    year: p.year,
    frameData: typeof p.frameData === 'string' ? JSON.parse(p.frameData) : p.frameData,
  }
}

export function useProjects(token: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [activeFilters, setActiveFilters] = useState<FilterState>(EMPTY_FILTERS)

  // Load projects from API on mount
  useEffect(() => {
    api.getProjects(token)
      .then((data) => setProjects(data.map(apiToProject)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isFiltered = useCallback(
    (project: Project): boolean => {
      const q = searchQuery.toLowerCase()
      if (q) {
        const matchesSearch =
          project.title.toLowerCase().includes(q) ||
          project.author.toLowerCase().includes(q) ||
          project.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchesSearch) return false
      }
      const { departments, projectTypes, tags, years } = activeFilters
      if (departments.length && !departments.includes(project.department)) return false
      if (projectTypes.length && !projectTypes.includes(project.projectType)) return false
      if (tags.length && !tags.some((t) => project.tags.includes(t))) return false
      if (years.length && !years.includes(project.year)) return false
      return true
    },
    [searchQuery, activeFilters]
  )

  // addProject: called by UploadModal after the API call succeeds
  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project])
  }, [])

  const deleteProject = useCallback(async (id: string, authorDbId: string) => {
    if (!token) return
    await api.deleteProject(id, authorDbId, token)
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [token])

  const likeProject = useCallback(async (projectId: string, userId: string) => {
    if (!token) return
    await api.toggleLike(projectId, userId, token)
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, likes: p.likes + 1 } : p))
    )
  }, [token])

  const unlikeProject = useCallback(async (projectId: string, userId: string) => {
    if (!token) return
    await api.toggleLike(projectId, userId, token)
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
    )
  }, [token])

  const addComment = useCallback(async (
    projectId: string,
    text: string,
    userId: string,
    userName: string,
  ) => {
    if (!token) return
    const raw = await api.addComment(projectId, text, userId, token)
    const cName: string = raw.author?.name ?? userName
    const newComment: Comment = {
      id: raw.id,
      text: raw.text,
      authorName: cName,
      authorInitials: cName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    )
  }, [token])

  const applyFilters = useCallback(() => setActiveFilters(filters), [filters])
  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setActiveFilters(EMPTY_FILTERS)
  }, [])

  const hasActiveFilters =
    activeFilters.departments.length > 0 ||
    activeFilters.projectTypes.length > 0 ||
    activeFilters.tags.length > 0 ||
    activeFilters.years.length > 0 ||
    searchQuery.length > 0

  return {
    projects,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    activeFilters,
    isFiltered,
    addProject,
    deleteProject,
    likeProject,
    unlikeProject,
    addComment,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  }
}
