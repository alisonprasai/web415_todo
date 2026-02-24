import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";

function TodoDetail() {
  const { id } = useParams(); // numeric id
  const navigate = useNavigate();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTodo() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await fetch(`${API_URL}/todos/${id}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }

        const json = await res.json();
        setTodo(json.data || json);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrMsg(err.message || "Failed to load todo.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadTodo();
    return () => controller.abort();
  }, [id]);

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const overdue = useMemo(() => {
    if (!todo?.dueDate) return false;
    const due = new Date(todo.dueDate);
    if (Number.isNaN(due.getTime())) return false;
    return !todo.completed && due.getTime() < Date.now();
  }, [todo]);

  const priorityStyle = (p) => {
    if (p === "high") return styles.badgeHigh;
    if (p === "medium") return styles.badgeMed;
    if (p === "low") return styles.badgeLow;
    return styles.badgeNeutral;
  };

  const toggleCompleted = async () => {
    if (!todo) return;

    const nextCompleted = !todo.completed;
    setSaving(true);

    // optimistic UI
    setTodo((prev) => ({ ...prev, completed: nextCompleted }));

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

      // If your backend returns updated object, you can sync:
      // const json = await res.json();
      // if (json?.data) setTodo(json.data);
    } catch (err) {
      console.error(err);
      // rollback
      setTodo((prev) => ({ ...prev, completed: !nextCompleted }));
      alert(err.message || "Could not update todo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!todo) return;
    const ok = window.confirm("Delete this todo?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Delete failed ${res.status}: ${text.slice(0, 200)}`);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed.");
    }
  };

  if (loading) {
    return <div style={styles.page}><div style={styles.stateBox}>Loading…</div></div>;
  }

  if (errMsg) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.stateBox, ...styles.stateError }}>{errMsg}</div>
        <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
          Back to list
        </button>
      </div>
    );
  }

  if (!todo) {
    return (
      <div style={styles.page}>
        <div style={styles.stateBox}>Todo not found.</div>
        <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
          ← Back
        </button>

        <div style={styles.headerActions}>
          <Link to={`/edit/${todo.id}`} style={styles.ghostBtn}>
            Edit
          </Link>
          <button onClick={handleDelete} style={styles.dangerBtn}>
            Delete
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.topRow}>
          <div>
            <div style={styles.kicker}>Todo #{todo.id}</div>
            <h1 style={styles.title}>{todo.title}</h1>
          </div>

          <div style={styles.badges}>
            <span style={{ ...styles.badge, ...priorityStyle(todo.priority) }}>
              {todo.priority || "none"}
            </span>
            {todo.category ? (
              <span style={{ ...styles.badge, ...styles.badgeCategory }}>
                {todo.category}
              </span>
            ) : null}
            {overdue ? (
              <span style={{ ...styles.badge, ...styles.badgeOverdue }}>overdue</span>
            ) : null}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Description</h3>
          {todo.description ? (
            <p style={styles.desc}>{todo.description}</p>
          ) : (
            <p style={styles.descMuted}>No description provided.</p>
          )}
        </div>

        <div style={styles.sectionGrid}>
          <div style={styles.metaCard}>
            <div style={styles.metaLabel}>Status</div>
            <div style={styles.metaValue}>
              {todo.completed ? "Completed ✅" : "Not completed ❌"}
            </div>
            <button
              onClick={toggleCompleted}
              disabled={saving}
              style={{
                ...styles.primaryBtn,
                opacity: saving ? 0.6 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Updating…" : todo.completed ? "Mark as not completed" : "Mark as completed"}
            </button>
          </div>

          <div style={styles.metaCard}>
            <div style={styles.metaLabel}>Due date</div>
            <div style={styles.metaValue}>{formatDate(todo.dueDate)}</div>
            <div style={styles.metaHint}>
              {todo.dueDate ? (overdue ? "This task is overdue." : "On track.") : "No deadline set."}
            </div>
          </div>

          <div style={styles.metaCard}>
            <div style={styles.metaLabel}>Created</div>
            <div style={styles.metaValue}>{formatDateTime(todo.createdAt)}</div>
            <div style={styles.metaLabel} style={{ ...styles.metaLabel, marginTop: 10 }}>
              Updated
            </div>
            <div style={styles.metaValue}>{formatDateTime(todo.updatedAt)}</div>
          </div>
        </div>
      </div>
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

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  card: {
    maxWidth: "900px",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  kicker: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "6px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    letterSpacing: "-0.5px",
    color: "#111827",
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
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    textTransform: "lowercase",
  },
  badgeHigh: {
    background: "#fff1f2",
    border: "1px solid #fecaca",
    color: "#9f1239",
    fontWeight: 800,
  },
  badgeMed: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontWeight: 800,
  },
  badgeLow: {
    background: "#ecfeff",
    border: "1px solid #a5f3fc",
    color: "#155e75",
    fontWeight: 800,
  },
  badgeNeutral: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    color: "#374151",
    fontWeight: 700,
  },
  badgeCategory: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontWeight: 700,
  },
  badgeOverdue: {
    background: "#fee2e2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontWeight: 900,
  },

  section: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px dashed #e5e7eb",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "14px",
    color: "#111827",
    fontWeight: 900,
  },
  desc: {
    margin: "10px 0 0",
    color: "#4b5563",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  descMuted: {
    margin: "10px 0 0",
    color: "#9ca3af",
    fontStyle: "italic",
  },

  sectionGrid: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },
  metaCard: {
    border: "1px solid #f1f5f9",
    borderRadius: "14px",
    padding: "12px",
    background: "#fff",
  },
  metaLabel: {
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 800,
  },
  metaValue: {
    marginTop: "6px",
    color: "#111827",
    fontSize: "14px",
    fontWeight: 800,
  },
  metaHint: {
    marginTop: "6px",
    color: "#6b7280",
    fontSize: "12px",
  },

  primaryBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "none",
    background: "#ff6a00",
    color: "#fff",
    fontWeight: 900,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
  ghostBtn: {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
    cursor: "pointer",
    fontWeight: 800,
  },

  stateBox: {
    maxWidth: "900px",
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
};

export default TodoDetail;