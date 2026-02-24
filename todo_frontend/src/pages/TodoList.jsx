import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    async function loadTodos() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await api.get("/todos");
        setTodos(res.data.data || res.data);
      } catch (err) {
        console.error(err);
        setErrMsg(
          err.response?.data?.message || "Failed to load todos."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

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
        <div style={{ ...styles.stateBox, ...styles.stateError }}>
          {errMsg}
        </div>
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

      {todos.length === 0 ? (
        <div style={styles.stateBox}>No todos yet.</div>
      ) : (
        <div style={styles.grid}>
          {todos.map((todo) => (
            <div key={todo.id} style={styles.card}>
              <div style={styles.cardTop}>
                <h3 style={styles.cardTitle}>{todo.title}</h3>
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

              {todo.description && (
                <p style={styles.desc}>{todo.description}</p>
              )}

              <div style={styles.actions}>
                <Link
                  to={`/todo/${todo.id}`}
                  style={styles.ghostBtn}
                >
                  View
                </Link>

                <Link
                  to={`/edit/${todo.id}`}
                  style={styles.ghostBtn}
                >
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

/* ✅ ORIGINAL DESIGN RESTORED */
const styles = {
  page: {
    padding: "32px",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 60%)",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
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
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#111827",
  },
  desc: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#6b7280",
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