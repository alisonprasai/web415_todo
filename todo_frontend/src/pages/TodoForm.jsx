import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function TodoForm() {
  const { id } = useParams(); // numeric id
  const navigate = useNavigate();

  const isEdit = useMemo(() => Boolean(id), [id]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD
  const [category, setCategory] = useState("general");
  const [completed, setCompleted] = useState(false); // only meaningful on edit

  const categoryPresets = ["general", "study", "work", "personal", "health"];

  useEffect(() => {
    const controller = new AbortController();

    async function loadTodo() {
      if (!id) return;

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
        const todo = json.data || json;

        setTitle(todo.title || "");
        setDescription(todo.description || "");
        setPriority(todo.priority || "medium");
        setCategory(todo.category || "general");
        setCompleted(Boolean(todo.completed));

        // ISO -> YYYY-MM-DD for date input
        if (todo.dueDate) {
          const d = new Date(todo.dueDate);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          setDueDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setDueDate("");
        }
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

  const titleError = useMemo(() => {
    const t = title.trim();
    if (!t) return "Title is required.";
    if (t.length < 2) return "Title is too short.";
    if (t.length > 80) return "Title is too long (max 80 characters).";
    return "";
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (titleError) {
      setErrMsg(titleError);
      return;
    }

    const method = isEdit ? "PATCH" : "POST";
    const url = isEdit ? `${API_URL}/todos/${id}` : `${API_URL}/todos`;

    // Build payload (match backend fields)
    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category: category.trim() || "general",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      ...(isEdit ? { completed } : {}), // only send completed on edit
    };

    try {
      setSaving(true);
      setErrMsg("");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Save failed ${res.status}: ${text.slice(0, 200)}`);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setErrMsg(err.message || "Could not save todo.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/");

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>{isEdit ? "Edit Todo" : "Create Todo"}</h1>
          <p style={styles.subtitle}>
            {isEdit
              ? "Update details, priority, due date, and completion status."
              : "Add a new task with priority and optional due date."}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          style={styles.secondaryBtn}
        >
          Cancel
        </button>
      </div>

      {loading ? (
        <div style={styles.stateBox}>Loading…</div>
      ) : (
        <div style={styles.card}>
          {errMsg ? (
            <div style={styles.errorBox}>
              <b>Oops:</b> {errMsg}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Title */}
            <div style={styles.field}>
              <label style={styles.label}>Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Finish assignment"
                style={{
                  ...styles.input,
                  borderColor: titleError ? "#fecaca" : "#e5e7eb",
                }}
                maxLength={80}
              />
              <div style={styles.helperRow}>
                <span style={{ color: titleError ? "#991b1b" : "#6b7280" }}>
                  {titleError ? titleError : "Keep it short and clear."}
                </span>
                <span style={styles.counter}>{title.trim().length}/80</span>
              </div>
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional details (steps, notes, links, etc.)"
                style={{ ...styles.input, ...styles.textarea }}
                rows={4}
              />
            </div>

            <div style={styles.grid2}>
              {/* Priority */}
              <div style={styles.field}>
                <label style={styles.label}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={styles.input}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div style={styles.field}>
                <label style={styles.label}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.input}
                />
                <span style={styles.hint}>Leave empty if no deadline.</span>
              </div>
            </div>

            {/* Category */}
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="general, study, work, personal..."
                style={styles.input}
              />

              <div style={styles.pillsRow}>
                {categoryPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    style={{
                      ...styles.pill,
                      ...(category === c ? styles.pillActive : {}),
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Completed (edit only) */}
            {isEdit ? (
              <div style={styles.field}>
                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={(e) => setCompleted(e.target.checked)}
                  />
                  <span style={styles.checkboxText}>Mark as completed</span>
                </label>
                <span style={styles.hint}>
                  You can also toggle this from the list view checkbox.
                </span>
              </div>
            ) : null}

            <div style={styles.actions}>
              <button
                type="submit"
                disabled={saving || Boolean(titleError)}
                style={{
                  ...styles.primaryBtn,
                  opacity: saving || titleError ? 0.6 : 1,
                  cursor: saving || titleError ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : isEdit ? "Update Todo" : "Create Todo"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={styles.secondaryBtnInline}
              >
                Back to list
              </button>
            </div>
          </form>
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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "18px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    letterSpacing: "-0.5px",
    color: "#1f2937",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },

  card: {
    maxWidth: "760px",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    padding: "16px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  stateBox: {
    maxWidth: "760px",
    padding: "16px",
    borderRadius: "14px",
    background: "#fff",
    border: "1px solid #f1f5f9",
    color: "#374151",
  },
  errorBox: {
    padding: "12px",
    borderRadius: "12px",
    background: "#fff1f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    marginBottom: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: 800,
    color: "#111827",
    fontSize: "13px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: "14px",
  },
  textarea: {
    resize: "vertical",
    lineHeight: 1.4,
  },
  hint: {
    color: "#6b7280",
    fontSize: "12px",
  },
  helperRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "12px",
  },
  counter: {
    color: "#6b7280",
    whiteSpace: "nowrap",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "12px",
  },

  pillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    fontSize: "12px",
    color: "#111827",
  },
  pillActive: {
    border: "1px solid rgba(255,106,0,0.35)",
    background: "rgba(255,106,0,0.10)",
    color: "#9a3412",
    fontWeight: 800,
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  checkboxText: {
    color: "#111827",
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#ff6a00",
    color: "#fff",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(255,106,0,0.25)",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
  secondaryBtnInline: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
  },
};

export default TodoForm;
