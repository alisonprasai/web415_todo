import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // ✅ search + filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | completed

  useEffect(() => {
    async function loadTodos() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await api.get("/todos");
        setTodos(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        setErrMsg(err.response?.data?.message || "Failed to load todos.");
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // ✅ client-side search + filter (title + description + category)
  const filteredTodos = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...todos];

    if (filter === "active") list = list.filter((t) => !t.completed);
    if (filter === "completed") list = list.filter((t) => t.completed);

    if (q) {
      list = list.filter((t) => {
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const cat = (t.category || "").toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    return list;
  }, [todos, search, filter]);

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (todo) => {
    if (!todo?.dueDate) return false;
    const due = new Date(todo.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    return !todo.completed && due.getTime() < Date.now();
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
      await api.delete(`/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  // ✅ checkbox toggle (optimistic + rollback)
  const toggleCompleted = async (todo) => {
    const nextCompleted = !todo.completed;

    // optimistic UI
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: nextCompleted } : t,
      ),
    );

    try {
      await api.patch(`/todos/${todo.id}`, { completed: nextCompleted });
    } catch (err) {
      console.error(err);
      // rollback
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t,
        ),
      );
      alert(err.response?.data?.message || "Could not update todo.");
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.stateBox}>Loading todos…</div>
      </div>
    );
  }

  if (errMsg) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.stateBox, ...styles.stateError }}>{errMsg}</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>My Todos</h1>
        <Link to="/new" style={styles.primaryBtn}>
          + New Todo
        </Link>
      </div>

      {/* ✅ Search + Filter badges */}
      <div style={styles.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, description, or category…"
          style={styles.search}
        />

        <div style={styles.filterBadges}>
          <button
            type="button"
            onClick={() => setFilter("all")}
            style={{
              ...styles.filterBadge,
              ...(filter === "all" ? styles.filterBadgeActive : {}),
            }}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            style={{
              ...styles.filterBadge,
              ...(filter === "active" ? styles.filterBadgeActive : {}),
            }}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            style={{
              ...styles.filterBadge,
              ...(filter === "completed" ? styles.filterBadgeActive : {}),
            }}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div style={styles.stateBox}>
          {todos.length === 0
            ? "No todos yet."
            : "No todos found. Try changing the filter or search."}
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredTodos.map((todo) => (
            <div key={todo.id} style={styles.card}>
              <div style={styles.cardTop}>
                {/* ✅ checkbox + title */}
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

                {/* ✅ priority/category/overdue labels */}
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

                  {/* ✅ keep your original Completed/Pending label too */}
                  <span
                    style={{
                      ...styles.badge,
                      ...(todo.completed
                        ? styles.badgeCompleted
                        : styles.badgePending),
                    }}
                  >
                    {todo.completed ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>

              {/* description */}
              {todo.description ? (
                <p style={todo.completed ? styles.doneDesc : styles.desc}>
                  {todo.description}
                </p>
              ) : (
                <p style={styles.descMuted}>No description</p>
              )}

              {/* ✅ due date line */}
              <div style={styles.metaRow}>
                <span style={styles.metaText}>
                  Due: {formatDate(todo.dueDate)}
                </span>
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

/* ✅ ORIGINAL DESIGN kept + minimal additions */
const styles = {
  page: {
    padding: "32px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 60%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
  headerRow: {
    maxWidth: "1100px",
    margin: "0 auto 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827",
  },
  primaryBtn: {
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: "12px",
    background: "#ff6a00",
    color: "#fff",
    fontWeight: "700",
  },

  toolbar: {
    maxWidth: "1100px",
    margin: "0 auto 16px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },
  search: {
    flex: "1 1 280px",
    padding: "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    outline: "none",
  },
  filterBadges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: "700",
  },
  filterBadgeActive: {
    border: "1px solid #ff6a00",
    background: "#fff7ed",
    color: "#9a3412",
  },

  grid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // updated layout but same feel
  cardTop: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
    fontWeight: 800,
  },
  doneTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#6b7280",
    fontWeight: 800,
    textDecoration: "line-through",
  },

  desc: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#6b7280",
  },
  doneDesc: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#9ca3af",
    textDecoration: "line-through",
  },
  descMuted: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#9ca3af",
    fontStyle: "italic",
  },

  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "12px",
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
    alignItems: "center",
  },
  badge: {
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "999px",
    fontWeight: "700",
  },
  badgeCompleted: {
    background: "#ecfdf5",
    color: "#065f46",
  },
  badgePending: {
    background: "#fff7ed",
    color: "#9a3412",
  },

  // priority / category / overdue
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
    fontWeight: "700",
  },

  actions: {
    marginTop: "14px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  ghostBtn: {
    textDecoration: "none",
    padding: "6px 12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: "13px",
    color: "#111827",
  },
  dangerBtn: {
    padding: "6px 12px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    fontSize: "13px",
    cursor: "pointer",
  },
  stateBox: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "16px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #f1f5f9",
  },
  stateError: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
  },
};

export default TodoList;
