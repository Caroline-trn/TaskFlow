const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type ApiTask = {
  id: string
  title: string
  description?: string
  status: 'en_attente' | 'en_cours' | 'terminee'
  priority: 'basse' | 'moyenne' | 'haute'
  userId: string
  created_at: string
  dueDate?: string | null
  archived: boolean
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('taskflow_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string | string[] } | null
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new Error(message || `Erreur ${response.status}`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export function login(email: string, password: string) {
  return request<{ access_token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  })
}

export function register(name: string, email: string, password: string) {
  return request<{ id: string; email: string; name: string }>('/auth/register', {
    method: 'POST', body: JSON.stringify({ name, email, password }),
  })
}

export function getTasks(archived = false) { return request<ApiTask[]>(`/tasks${archived ? '?archived=true' : ''}`) }
export function createTask(title: string, priority: ApiTask['priority'], dueDate?: string, description?: string) { return request<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify({ title, priority, dueDate, description }) }) }
export function updateTask(id: string, data: { title?: string; description?: string; dueDate?: string | null; archived?: boolean; status?: 'en_attente' | 'en_cours' | 'terminee'; priority?: ApiTask['priority'] }) { return request<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export function deleteTask(id: string) { return request<void>(`/tasks/${id}`, { method: 'DELETE' }) }
export type WorkspaceItem = { id: string; name: string; userId: string }
export function getProjects() { return request<WorkspaceItem[]>('/workspace/projects') }
export function createProject(name: string) { return request<WorkspaceItem>('/workspace/projects', { method: 'POST', body: JSON.stringify({ name }) }) }
export function getMembers() { return request<WorkspaceItem[]>('/workspace/members') }
export function createMember(name: string) { return request<WorkspaceItem>('/workspace/members', { method: 'POST', body: JSON.stringify({ name }) }) }
export type UserSettings = { notificationsEnabled: boolean; darkMode: boolean }
export function getSettings() { return request<UserSettings>('/workspace/settings') }
export function updateSettings(settings: Partial<UserSettings>) { return request<UserSettings>('/workspace/settings', { method: 'POST', body: JSON.stringify(settings) }) }
