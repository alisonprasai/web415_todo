import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import todoIcon from "../images/todo.png";

function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* LEFT SIDE */}
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>
            <img src={todoIcon} alt="logo" style={styles.logoIcon} />
            Todify
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/" style={styles.link}>
                Home
              </Link>
              <Link to="/new" style={styles.link}>
                New Todo
              </Link>
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={styles.right}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/signup" style={styles.primaryBtn}>
                Sign Up
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} style={styles.primaryBtn}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    background: "#ffffff",
    borderBottom: "1px solid #f1f5f9",
    padding: "12px 0",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logo: {
    display: "flex",              // ✅ Align icon + text
    alignItems: "center",
    gap: "8px",                   // spacing between icon & text
    textDecoration: "none",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },
  logoIcon: {
    width: "22px",                // adjust size if needed
    height: "22px",
    objectFit: "contain",
  },
  link: {
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
  },
  primaryBtn: {
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#ff6a00",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Navbar;