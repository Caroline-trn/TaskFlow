import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import "./App.css";
import {
  createTask,
  deleteTask,
  forgotPassword,
  getCurrentUser,
  getTasks,
  login,
  register,
  resetPassword,
  updateTask,
  type ApiTask,
} from "./api";

type Filter = "all" | "today" | "completed";

type User = { name: string; email: string };

function App() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] =
    useState<ApiTask["priority"]>("moyenne");
  const [editing, setEditing] = useState<ApiTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ApiTask["status"]>("en_attente");
  const [editPriority, setEditPriority] =
    useState<ApiTask["priority"]>("moyenne");
  const [editDueDate, setEditDueDate] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    if (!localStorage.getItem("taskflow_token")) return;
    try {
      setTasks(await getTasks());
    } catch {
      localStorage.removeItem("taskflow_token");
      setUser(null);
      setMessage("Votre session a expiré.");
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("taskflow_token")) return;
    getCurrentUser()
      .then(setUser)
      .then(() => loadTasks())
      .catch(() => {
        localStorage.removeItem("taskflow_token");
        setMessage("Votre session a expiré.");
      });
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("resetToken");
    if (token) {
      setResetToken(token);
      setResetMode(true);
      setAuthOpen(true);
    }
  }, []);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesFilter =
          filter === "all" ||
          (filter === "completed"
            ? task.status === "terminee"
            : task.dueDate === new Date().toISOString().slice(0, 10));
        return matchesSearch && matchesFilter;
      }),
    [filter, search, tasks],
  );

  async function addNewTask() {
    if (!newTitle.trim() || !user) return;
    setLoading(true);
    try {
      const task = await createTask(
        newTitle.trim(),
        newPriority,
        newDueDate || undefined,
      );
      setTasks((current) => [task, ...current]);
      setNewTitle("");
      setNewDueDate("");
      setNewPriority("moyenne");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible de créer la tâche.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(task: ApiTask) {
    try {
      const updated = await updateTask(task.id, {
        status: task.status === "terminee" ? "en_attente" : "terminee",
      });
      setTasks((current) =>
        current.map((item) => (item.id === task.id ? updated : item)),
      );
    } catch {
      setMessage("La mise à jour n’a pas été enregistrée.");
    }
  }

  async function removeTask(task: ApiTask) {
    try {
      await deleteTask(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch {
      setMessage("La suppression a échoué.");
    }
  }

  function openEdit(task: ApiTask) {
    setEditing(task);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate ?? "");
  }

  async function saveEdit() {
    if (!editing || !editTitle.trim()) return;
    try {
      const updated = await updateTask(editing.id, {
        title: editTitle.trim(),
        description: editDescription,
        status: editStatus,
        priority: editPriority,
        dueDate: editDueDate || null,
      });
      setTasks((current) =>
        current.map((task) => (task.id === editing.id ? updated : task)),
      );
      setEditing(null);
      setMessage("Tâche enregistrée.");
    } catch {
      setMessage("La modification n’a pas été enregistrée.");
    }
  }

  async function connect() {
    setAuthError("");
    setLoading(true);
    try {
      if (authMode === "register")
        await register(name.trim(), email.trim(), password);
      const result = await login(email.trim(), password);
      localStorage.setItem("taskflow_token", result.access_token);
      setUser(result.user);
      setAuthOpen(false);
      setPassword("");
      await loadTasks();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Connexion impossible.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function requestReset() {
    setAuthError("");
    try {
      const result = await forgotPassword(email.trim());
      setAuthError(result.message);
      if (result.resetToken) {
        setResetToken(result.resetToken);
        setResetMode(true);
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Demande impossible.",
      );
    }
  }

  async function applyReset() {
    setAuthError("");
    if (password !== resetConfirmation) {
      setAuthError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const result = await resetPassword(resetToken, password);
      setResetMode(false);
      setForgotMode(false);
      setAuthMode("login");
      setAuthOpen(true);
      setAuthError("");
      setMessage(result.message);
      setPassword("");
      setResetConfirmation("");
      setResetToken("");
      setShowResetPassword(false);
      setShowResetConfirmation(false);
      window.history.replaceState({}, "", window.location.pathname);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Réinitialisation impossible.",
      );
    }
  }

  function openLoginForm() {
    setResetMode(false);
    setForgotMode(false);
    setAuthMode("login");
    setAuthError("");
    setAuthOpen(true);
  }

  function logout() {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.removeItem("taskflow_token");
      setUser(null);
      setTasks([]);
    }
  }

  return (
    <main className="todo-app">
      <header className="todo-header">
        <div>
          <p className="app-label">TASKFLOW</p>
          <h1>Ma journée</h1>
          <p className="date-label">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="header-user">
          {user ? (
            <>
              <span>{user.name}</span>
              <button
                onClick={logout}
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <button className="auth-button" onClick={openLoginForm}>
              Se connecter
            </button>
          )}
        </div>
      </header>
      {message && (
        <div className="notice">
          {message}
          <button onClick={() => setMessage("")} aria-label="Fermer">
            <X size={15} />
          </button>
        </div>
      )}
      <section className="quick-add">
        <Plus size={20} />
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && void addNewTask()}
          placeholder="Ajouter une tâche"
          disabled={!user}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(event) => setNewDueDate(event.target.value)}
          disabled={!user}
        />
        <select
          value={newPriority}
          onChange={(event) =>
            setNewPriority(event.target.value as ApiTask["priority"])
          }
          disabled={!user}
        >
          <option value="moyenne">Priorité normale</option>
          <option value="haute">Priorité haute</option>
          <option value="basse">Priorité basse</option>
        </select>
        <button
          onClick={() => void addNewTask()}
          disabled={loading || !user}
          aria-label="Ajouter"
        >
          <Plus size={18} />
        </button>
      </section>
      <nav className="todo-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Toutes <b>{tasks.length}</b>
        </button>
        <button
          className={filter === "today" ? "active" : ""}
          onClick={() => setFilter("today")}
        >
          Aujourd’hui
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Terminées
        </button>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher"
        />
      </nav>
      {!user ? (
        <div className="empty welcome">
          <h2>Vos tâches, simplement.</h2>
          <p>Connectez-vous pour créer et retrouver vos tâches.</p>
          <button className="primary" onClick={openLoginForm}>
            Commencer
          </button>
        </div>
      ) : (
        <section className="task-list">
          {visibleTasks.length === 0 ? (
            <div className="empty">
              <h2>Aucune tâche ici</h2>
              <p>Ajoutez une tâche pour commencer.</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <article
                className={`todo-row ${task.status === "terminee" ? "is-done" : ""}`}
                key={task.id}
              >
                <button
                  className="check"
                  onClick={() => void toggleTask(task)}
                  aria-label="Terminer"
                >
                  {task.status === "terminee" && <Check size={15} />}
                </button>
                <div className="task-copy">
                  <strong>{task.title}</strong>
                  <small>
                    {task.dueDate
                      ? `Échéance : ${task.dueDate}`
                      : "Sans échéance"}{" "}
                    · {task.priority}
                  </small>
                </div>
                <button
                  className="row-action"
                  onClick={() => openEdit(task)}
                  title="Modifier"
                  aria-label="Modifier"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="row-action danger"
                  onClick={() => void removeTask(task)}
                  title="Supprimer"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          )}
        </section>
      )}
      {editing && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-title">
              <h2>Modifier la tâche</h2>
              <button onClick={() => setEditing(null)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <label>
              Titre
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
              />
            </label>
            <div className="form-grid">
              <label>
                Statut
                <select
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(event.target.value as ApiTask["status"])
                  }
                >
                  <option value="en_attente">À faire</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                </select>
              </label>
              <label>
                Priorité
                <select
                  value={editPriority}
                  onChange={(event) =>
                    setEditPriority(event.target.value as ApiTask["priority"])
                  }
                >
                  <option value="basse">Basse</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="haute">Haute</option>
                </select>
              </label>
            </div>
            <label>
              Échéance
              <input
                type="date"
                value={editDueDate}
                onChange={(event) => setEditDueDate(event.target.value)}
              />
            </label>
            <button className="primary full" onClick={() => void saveEdit()}>
              Enregistrer
            </button>
          </div>
        </div>
      )}
      {authOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            key={`${resetMode ? "reset" : forgotMode ? "forgot" : authMode}`}
          >
            <div className="modal-title">
              <h2>
                {resetMode
                  ? "Nouveau mot de passe"
                  : forgotMode
                    ? "Mot de passe oublié"
                    : authMode === "login"
                      ? "Se connecter"
                      : "Créer un compte"}
              </h2>
              <button
                onClick={() => {
                  setAuthOpen(false);
                  setAuthError("");
                }}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            {authError && (
              <div className="auth-error" role="alert">
                {authError}
              </div>
            )}
            {resetMode ? (
              <>
                <label>
                  Nouveau mot de passe
                  <span className="password-field">
                    <input
                      type={showResetPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowResetPassword((visible) => !visible)
                      }
                      aria-label={
                        showResetPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      title={
                        showResetPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showResetPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </span>
                </label>
                <label>
                  Confirmer le mot de passe
                  <span className="password-field">
                    <input
                      type={showResetConfirmation ? "text" : "password"}
                      value={resetConfirmation}
                      onChange={(event) =>
                        setResetConfirmation(event.target.value)
                      }
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowResetConfirmation((visible) => !visible)
                      }
                      aria-label={
                        showResetConfirmation
                          ? "Masquer la confirmation"
                          : "Afficher la confirmation"
                      }
                      title={
                        showResetConfirmation
                          ? "Masquer la confirmation"
                          : "Afficher la confirmation"
                      }
                    >
                      {showResetConfirmation ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </span>
                </label>
                <button
                  className="primary full"
                  onClick={() => void applyReset()}
                >
                  Réinitialiser
                </button>
              </>
            ) : forgotMode ? (
              <>
                <label>
                  Adresse email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <button
                  className="primary full"
                  onClick={() => void requestReset()}
                >
                  Envoyer la demande
                </button>
                <button
                  className="switch-auth"
                  onClick={() => {
                    setForgotMode(false);
                    setAuthError("");
                  }}
                >
                  Retour à la connexion
                </button>
              </>
            ) : (
              <>
                <>
                  {authMode === "register" && (
                    <label>
                      Nom
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </label>
                  )}
                </>
                <label>
                  Adresse email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label>
                  Mot de passe
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && void connect()
                    }
                  />
                </label>
                <button
                  className="primary full"
                  onClick={() => void connect()}
                  disabled={loading}
                >
                  {authMode === "login" ? "Se connecter" : "Créer mon compte"}
                </button>
                {authMode === "login" && (
                  <button
                    className="switch-auth"
                    onClick={() => {
                      setForgotMode(true);
                      setAuthError("");
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                )}
                <button
                  className="switch-auth"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                >
                  {authMode === "login"
                    ? "Créer un compte"
                    : "J’ai déjà un compte"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
