import { useEffect, useState } from 'react'
import { Archive, Bell, CalendarDays, Check, Pencil, Plus, Settings2, Users, X } from 'lucide-react'
import { createMember, createProject, getMembers, getProjects, getSettings, getTasks, updateSettings, updateTask, type ApiTask, type WorkspaceItem } from './api'

type FeatureTab = 'tasks' | 'projects' | 'team' | 'archive' | 'calendar' | 'notifications' | 'settings'
type LocalTask = ApiTask & { archived?: boolean }

function CalendarGrid({ tasks }: { tasks: LocalTask[] }) {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => index < offset ? null : index - offset + 1)
  const month = today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return <div className="calendar-grid"><h3>{month}</h3><div className="calendar-weekdays">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-days">{cells.map((day, index) => { const date = day ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''; const dayTasks = tasks.filter((task) => task.dueDate === date); return <div className={`${day === today.getDate() ? 'today' : ''}`} key={`${date}-${index}`}>{day && <><b>{day}</b>{dayTasks.map((task) => <small title={task.title} key={task.id} />)}</>}</div> })}</div></div>
}

const tabs: { id: FeatureTab; label: string }[] = [
  { id: 'tasks', label: 'Tâches' },
  { id: 'projects', label: 'Projets' },
  { id: 'team', label: 'Équipe' },
  { id: 'archive', label: 'Archives' },
  { id: 'calendar', label: 'Calendrier' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Paramètres' },
]

export default function WorkspaceFeatures({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [tab, setTab] = useState<FeatureTab>('tasks')
  const [tasks, setTasks] = useState<LocalTask[]>([])
  const [editing, setEditing] = useState<LocalTask | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<ApiTask['priority']>('moyenne')
  const [status, setStatus] = useState<ApiTask['status']>('en_attente')
  const [dueDate, setDueDate] = useState('')
  const [projects, setProjects] = useState<WorkspaceItem[]>([])
  const [team, setTeam] = useState<WorkspaceItem[]>([])
  const [notifications, setNotifications] = useState(() => localStorage.getItem('taskflow_notifications') !== 'false')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('taskflow_theme') === 'dark')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !localStorage.getItem('taskflow_token')) {
      setTasks([])
      setProjects([])
      setTeam([])
      return
    }
    getTasks().then((remoteTasks) => setTasks(remoteTasks)).catch(() => setMessage('Connectez-vous pour gérer vos tâches.'))
    getProjects().then(setProjects).catch(() => setMessage('Impossible de charger les projets.'))
    getMembers().then(setTeam).catch(() => setMessage('Impossible de charger l’équipe.'))
    getSettings().then((settings) => { setNotifications(settings.notificationsEnabled); setDarkMode(settings.darkMode) }).catch(() => setMessage('Impossible de charger les paramètres.'))
  }, [isAuthenticated])

  function openEdit(task: LocalTask) {
    setEditing(task)
    setTitle(task.title)
    setDescription(task.description ?? '')
    setPriority(task.priority)
    setStatus(task.status)
    setDueDate(task.dueDate ?? '')
  }

  async function saveEdit() {
    if (!editing || !title.trim()) return
    try {
      const updated = await updateTask(editing.id, { title: title.trim(), priority, description, status, dueDate: dueDate || null })
      setTasks((current) => current.map((task) => task.id === editing.id ? { ...task, ...updated } : task))
      setEditing(null)
      setMessage('Tâche modifiée.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Modification impossible.') }
  }

  async function archiveTask(task: LocalTask) {
    try {
      await updateTask(task.id, { archived: true })
      setTasks((current) => current.filter((item) => item.id !== task.id))
      setMessage('Tâche archivée.')
    } catch { setMessage('Archivage impossible.') }
  }

  async function addLocalItem(kind: 'project' | 'member') {
    const value = window.prompt(kind === 'project' ? 'Nom du projet' : 'Nom du membre')?.trim()
    if (!value) return
    try {
      if (kind === 'project') {
        const project = await createProject(value)
        setProjects((current) => [...current, project])
      } else {
        const member = await createMember(value)
        setTeam((current) => [...current, member])
      }
    } catch { setMessage('Enregistrement impossible.') }
  }

  const [archived, setArchived] = useState<LocalTask[]>([])

  useEffect(() => {
    if (tab !== 'archive' || !localStorage.getItem('taskflow_token')) return
    getTasks(true).then(setArchived).catch(() => setMessage('Impossible de charger les archives.'))
  }, [tab])

  useEffect(() => {
    if (!notifications || !('Notification' in window) || Notification.permission !== 'granted') return
    const overdue = tasks.filter((task) => task.dueDate && task.status !== 'terminee' && new Date(`${task.dueDate}T23:59:59`) < new Date())
    if (overdue.length > 0) new Notification('TaskFlow', { body: `${overdue.length} tâche${overdue.length > 1 ? 's' : ''} en retard.` })
  }, [notifications, tasks])

  async function restoreTask(task: LocalTask) {
    try {
      await updateTask(task.id, { archived: false })
      setArchived((current) => current.filter((item) => item.id !== task.id))
      setMessage('Tâche restaurée.')
    } catch { setMessage('Restauration impossible.') }
  }

  return <section className="workspace-features">
    <div className="feature-tabs">{tabs.map(({ id, label }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>)}</div>
    {message && <div className="feature-message">{message}<button onClick={() => setMessage('')} aria-label="Fermer"><X size={14} /></button></div>}
    {tab === 'tasks' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">GESTION</span><h2>Modifier vos tâches</h2></div></div>{tasks.length === 0 ? <p className="feature-empty">Aucune tâche synchronisée. Connectez-vous pour afficher vos tâches.</p> : tasks.map((task) => <div className="feature-row" key={task.id}><span><b>{task.title}</b><small>{task.priority} · {task.status}</small></span><span className="feature-actions"><button onClick={() => openEdit(task)} title="Modifier"><Pencil size={15} /></button><button onClick={() => archiveTask(task)} title="Archiver"><Archive size={15} /></button></span></div>)}</div>}
    {tab === 'projects' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">ORGANISATION</span><h2>Projets</h2></div><button className="feature-primary" onClick={() => addLocalItem('project')}><Plus size={15} /> Nouveau</button></div>{projects.map((project) => <div className="feature-row" key={project.id}><span><b>{project.name}</b><small>Projet actif</small></span><Check size={16} /></div>)}</div>}
    {tab === 'team' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">COLLABORATION</span><h2>Équipe</h2></div><button className="feature-primary" onClick={() => addLocalItem('member')}><Plus size={15} /> Ajouter</button></div>{team.length === 0 ? <p className="feature-empty">Ajoutez les membres de votre équipe.</p> : team.map((member) => <div className="feature-row" key={member.id}><span><b>{member.name}</b><small>Membre de l’équipe</small></span><Users size={16} /></div>)}</div>}
    {tab === 'archive' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">HISTORIQUE</span><h2>Archives</h2></div></div>{archived.length === 0 ? <p className="feature-empty">Aucune tâche archivée.</p> : archived.map((task) => <div className="feature-row" key={task.id}><span><b>{task.title}</b><small>Archivée</small></span><button className="feature-primary" onClick={() => restoreTask(task)}>Restaurer</button></div>)}</div>}
    {tab === 'calendar' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">PLANIFICATION</span><h2>Échéances</h2></div><CalendarDays size={20} /></div><CalendarGrid tasks={tasks} /></div>}
    {tab === 'notifications' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">ACTIVITÉ</span><h2>Notifications</h2></div><Bell size={20} /></div><label className="feature-toggle"><span>Recevoir les notifications</span><input type="checkbox" checked={notifications} onChange={async (event) => { const enabled = event.target.checked; setNotifications(enabled); await updateSettings({ notificationsEnabled: enabled }); if (enabled && 'Notification' in window) { const permission = await Notification.requestPermission(); if (permission === 'granted') new Notification('TaskFlow', { body: 'Les alertes d’échéances sont activées.' }) } }} /></label><p className="feature-empty">Les alertes de tâches et d’échéances utilisent les notifications de votre navigateur.</p></div>}
    {tab === 'settings' && <div className="feature-content"><div className="feature-heading"><div><span className="feature-kicker">PRÉFÉRENCES</span><h2>Paramètres</h2></div><Settings2 size={20} /></div><label className="feature-toggle"><span>Mode sombre</span><input type="checkbox" checked={darkMode} onChange={async (event) => { const enabled = event.target.checked; setDarkMode(enabled); document.documentElement.dataset.theme = enabled ? 'dark' : 'light'; await updateSettings({ darkMode: enabled }) }} /></label><p className="feature-empty">Vos préférences sont enregistrées sur votre compte.</p></div>}
    {editing && <div className="feature-edit"><div><h3>Modifier la tâche</h3><button onClick={() => setEditing(null)} aria-label="Fermer"><X size={16} /></button></div><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" /><select value={priority} onChange={(event) => setPriority(event.target.value as ApiTask['priority'])}><option value="haute">Haute</option><option value="moyenne">Moyenne</option><option value="basse">Basse</option></select><select value={status} onChange={(event) => setStatus(event.target.value as ApiTask['status'])}><option value="en_attente">À faire</option><option value="en_cours">En cours</option><option value="terminee">Terminée</option></select><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /><button className="feature-primary" onClick={saveEdit}>Enregistrer</button></div>}
  </section>
}
