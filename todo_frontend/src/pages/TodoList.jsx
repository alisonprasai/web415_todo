import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | due | priority

  useEffect(() => {
    const controller = new AbortController();

    async function loadTodos() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(`${API_URL}/todos`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }

        const json = await res.json();
        setTodos(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrMsg(err.message || "Failed to load todos.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = [...todos];

    // filter
    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);

    // search
    if (q) {
      list = list.filter((t) => {
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const cat = (t.category || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // sort
    const priorityRank = (p) => {
      if (p === "high") return 3;
      if (p === "medium") return 2;
      if (p === "low") return 1;
      return 0;
    };

    list.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "due") {
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return ad - bd;
      }
      if (sortBy === "priority") {
        return priorityRank(b.priority) - priorityRank(a.priority);
      }
      return 0;
    });

    return list;
  }, [todos, search, filter, sortBy]);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate) return false;
    const due = new Date(todo.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    const now = new Date();
    // overdue only if not completed and due date is before today (time considered)
    return !todo.completed && due.getTime() < now.getTime();
  };

  const priorityStyle = (p) => {
    if (p === "high") return styles.badgeHigh;
    if (p === "medium") return styles.badgeMed;
    if (p === "low") return styles.badgeLow;
    return styles.badgeNeutral;
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this todo?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed ${res.status}: ${text.slice(0, 200)}`);
      }

      setTodos((prev) => prev.filter((t) => Number(t.id) !== Number(id)));
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed.");
    }
  };

  const toggleCompleted = async (todo) => {
    // optimistic UI
    const nextCompleted = !todo.completed;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: nextCompleted } : t,
      ),
    );

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Update failed ${res.status}: ${text.slice(0, 200)}`);
      }

      // If your backend returns updated object, you can sync it:
      // const json = await res.json();
      // if (json?.data) setTodos(prev => prev.map(t => t.id === todo.id ? json.data : t));
    } catch (err) {
      console.error(err);
      // rollback
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t,
        ),
      );
      alert(err.message || "Could not update todo.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Todos</h1>
          <p style={styles.subtitle}>
            Total: <b>{stats.total}</b> · Completed: <b>{stats.completed}</b> ·
            Remaining: <b>{stats.remaining}</b>
          </p>
        </div>

        <Link to="/new" style={styles.primaryBtn}>
          + New Todo
        </Link>
      </div>

      <div style={styles.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description, or category…"
          style={styles.search}
        />

        <div style={styles.controls}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="due">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.stateBox}>Loading todos…</div>
      ) : errMsg ? (
        <div style={{ ...styles.stateBox, ...styles.stateError }}>{errMsg}</div>
      ) : filteredTodos.length === 0 ? (
        <div style={styles.stateBox}>
          No todos found. Try changing the filter or create a new one.
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredTodos.map((todo) => (
            <div key={todo.id} style={styles.card}>
              <div style={styles.cardTop}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={!!todo.completed}
                    onChange={() => toggleCompleted(todo)}
                  />
                  <span
                    style={todo.completed ? styles.doneTitle : styles.cardTitle}
                  >
                    {todo.title}
                  </span>
                </label>

                <div style={styles.badges}>
                  <span
                    style={{ ...styles.badge, ...priorityStyle(todo.priority) }}
                  >
                    {todo.priority || "none"}
                  </span>
                  {todo.category ? (
                    <span style={{ ...styles.badge, ...styles.badgeCategory }}>
                      {todo.category}
                    </span>
                  ) : null}
                  {isOverdue(todo) ? (
                    <span style={{ ...styles.badge, ...styles.badgeOverdue }}>
                      overdue
                    </span>
                  ) : null}
                </div>
              </div>

              {todo.description ? (
                <p style={todo.completed ? styles.doneDesc : styles.cardDesc}>
                  {todo.description}
                </p>
              ) : (
                <p style={styles.cardDescMuted}>No description</p>
              )}

              <div style={styles.metaRow}>
                <span style={styles.metaText}>
                  Due: {todo.dueDate ? formatDate(todo.dueDate) : "—"}
                </span>
                <span style={styles.metaText}>#{todo.id}</span>
              </div>

              <div style={styles.actions}>
                <Link to={`/todo/${todo.id}`} style={styles.ghostBtn}>
                  View
                </Link>

                <Link to={`/edit/${todo.id}`} style={styles.ghostBtn}>
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(todo.id)}
                  style={styles.dangerBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 60%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    letterSpacing: "-0.5px",
    color: "#1f2937",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  primaryBtn: {
    textDecoration: "none",
    background: "#ff6a00",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(255,106,0,0.25)",
  },

  toolbar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    marginBottom: "18px",
  },
  search: {
    flex: "1 1 280px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
  },
  controls: {
    display: "flex",
    gap: "10px",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
  },

  stateBox: {
    padding: "16px",
    borderRadius: "14px",
    background: "#fff",
    border: "1px solid #f1f5f9",
    color: "#374151",
  },
  stateError: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    padding: "14px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  cardTop: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "8px",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#111827",
  },
  doneTitle: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#6b7280",
    textDecoration: "line-through",
  },
  cardDesc: {
    margin: "8px 0 0",
    color: "#4b5563",
    lineHeight: 1.4,
    minHeight: "40px",
  },
  doneDesc: {
    margin: "8px 0 0",
    color: "#9ca3af",
    lineHeight: 1.4,
    minHeight: "40px",
    textDecoration: "line-through",
  },
  cardDescMuted: {
    margin: "8px 0 0",
    color: "#9ca3af",
    fontStyle: "italic",
    minHeight: "40px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px dashed #e5e7eb",
  },
  metaText: {
    color: "#6b7280",
    fontSize: "12px",
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  badge: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    color: "#374151",
    background: "#fff",
    textTransform: "lowercase",
  },
  badgeHigh: {
    background: "#fff1f2",
    border: "1px solid #fecaca",
    color: "#9f1239",
  },
  badgeMed: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
  },
  badgeLow: {
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#155e75",
  },
  badgeNeutral: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#374151",
  },
  badgeCategory: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#334155",
  },
  badgeOverdue: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  ghostBtn: {
    textDecoration: "none",
    padding: "8px 10px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    color: "#111827",
    background: "#fff",
  },
  dangerBtn: {
    padding: "8px 10px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    cursor: "pointer",
  },
};

export default TodoList;
