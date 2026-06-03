// Central API client — all calls go through here.
const BASE = (import.meta.env.VITE_API_URL as string) || ''

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

export const api = {
  // Auth
  dartmouthLogin: (name: string, email: string) =>
    apiFetch<{ token: string; user: any; isNewUser: boolean }>(
      '/api/auth/dartmouth',
      { method: 'POST', body: JSON.stringify({ name, email }) }
    ),

  // Users / profiles
  getUser: (id: string, token?: string | null) =>
    apiFetch<any>(`/api/users/${id}`, {}, token),

  updateUser: (id: string, formData: FormData, token: string) =>
    apiFetch<any>(`/api/users/${id}`, { method: 'PATCH', body: formData }, token),

  // Projects
  getProjects: (token?: string | null) =>
    apiFetch<any[]>('/api/projects', {}, token),

  createProject: (formData: FormData, token: string) =>
    apiFetch<any>('/api/projects', { method: 'POST', body: formData }, token),

  deleteProject: (id: string, authorId: string, token: string) =>
    apiFetch<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ authorId }),
    }, token),

  toggleLike: (projectId: string, userId: string, token: string) =>
    apiFetch<{ liked: boolean }>(`/api/projects/${projectId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }, token),

  // Comments
  addComment: (projectId: string, text: string, authorId: string, token: string) =>
    apiFetch<any>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ text, authorId, projectId }),
    }, token),

  // Messages
  sendMessage: (fromId: string, toId: string, subject: string, body: string, token: string) =>
    apiFetch<any>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ fromId, toId, subject, body }),
    }, token),

  getMessages: (userId: string, token: string) =>
    apiFetch<any[]>(`/api/messages/user/${userId}`, {}, token),

  getThread: (userId: string, otherUserId: string, token: string) =>
    apiFetch<any[]>(`/api/messages/thread/${userId}/${otherUserId}`, {}, token),
}
