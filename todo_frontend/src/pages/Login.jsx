import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg("");

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token);
      navigate("/");
    } catch (error) {
      setErrMsg(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.page}>
      {/* Wrapper positioned 40px below navbar */}
      <div style={styles.wrapper}>
        
        {/* ✅ LEFT: Images Section (no background / no shadow) */}
        <div style={styles.imagesPane}>
          <div style={styles.imagesGrid}>
            <img src="src/images/img1.jpg" alt="img1" style={styles.gridImg} />
            <img src="src/images/img2.jpg" alt="img2" style={styles.gridImg} />
            <img src="src/images/img3.jpg" alt="img3" style={styles.gridImg} />
            <img src="src/images/img4.jpg" alt="img4" style={styles.gridImg} />
          </div>
        </div>

        {/* ✅ RIGHT: Login Section (keeps white design) */}
        <div style={styles.loginPane}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Login to manage your todos</p>

          {errMsg && (
            <div style={{ ...styles.stateBox, ...styles.stateError }}>
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />

            <button type="submit" style={styles.primaryBtn}>
              Login
            </button>
          </form>

          <p style={styles.footerText}>
            Don’t have an account?{" "}
            <Link to="/signup" style={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "120px 32px 32px", // ✅ 40px below navbar
    background: "linear-gradient(180deg, #fff7f0 0%, #ffffff 60%)",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },

  /* ✅ New wrapper instead of white shell */
  wrapper: {
    width: "100%",
    maxWidth: "860px",
    margin: "0 auto",
    display: "flex",
    alignItems: "stretch",
    gap: "40px", // spacing between image and login sections
  },

  /* ✅ LEFT pane — completely transparent */
  imagesPane: {
    flex: "1 1 50%",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  imagesGrid: {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    gap: "14px",
  },

  gridImg: {
    width: "70%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "52px",
    padding: "12px",
  },

  /* ✅ RIGHT pane — keeps original white card design */
  loginPane: {
    flex: "1 1 50%",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f2937",
  },

  subtitle: {
    margin: "6px 0 20px",
    fontSize: "14px",
    color: "#6b7280",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    outline: "none",
  },

  primaryBtn: {
    marginTop: "6px",
    padding: "10px",
    borderRadius: "12px",
    background: "#ff6a00",
    color: "#fff",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(255,106,0,0.25)",
  },

  stateBox: {
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "16px",
  },

  stateError: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
  },

  footerText: {
    marginTop: "18px",
    fontSize: "14px",
    color: "#6b7280",
  },

  link: {
    color: "#ff6a00",
    fontWeight: 600,
    textDecoration: "none",
  },
};

export default Login;