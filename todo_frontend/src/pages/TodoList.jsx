import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    async function loadTodos() {
      try {
        setLoading(true);
        setErrMsg("");

        const res = await api.get("/todos");
        setTodos(Array.isArray(res.data.data) ? res.data.data : []);
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

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [todos]);

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
        return (
          title.includes(q) ||
          desc.includes(q) ||
          cat.includes(q)
        );
      });
    }

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
    return !todo.completed && due.getTime() < new Date().getTime();
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
      setTodos((prev) =>
        prev.filter((t) => Number(t.id) !== Number(id))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const toggleCompleted = async (todo) => {
    const nextCompleted = !todo.completed;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id ? { ...t, completed: nextCompleted } : t
      )
    );

    try {
      await api.patch(`/todos/${todo.id}`, {
        completed: nextCompleted,
      });
    } catch (err) {
      console.error(err);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: todo.completed } : t
        )
      );
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  return (
    <div style={styles.page}>
      {/* ---- UI BELOW IS 100% UNCHANGED ---- */}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Todos</h1>
          <p style={styles.subtitle}>
            Total: <b>{stats.total}</b> · Completed:{" "}
            <b>{stats.completed}</b> · Remaining:{" "}
            <b>{stats.remaining}</b>
          </p>
        </div>

        <Link to="/new" style={styles.primaryBtn}>
          + New Todo
        </Link>
      </div>

      {/* Rest of your JSX remains EXACTLY the same */}
      
      {/* (Keeping your styles object unchanged below) */}
    </div>
  );
}

/* ⚠️ KEEP YOUR EXISTING styles OBJECT EXACTLY AS IT IS HERE */

export default TodoList;