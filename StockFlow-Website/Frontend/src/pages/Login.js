import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Boxes, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";
export default function Login() {
  const { user, login } = useAuth();
  const [error, setError] = useState("");
  const nav = useNavigate();
  const loc = useLocation();
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (f) => {
    setError("");
    try {
      await login(f.username, f.password);
      nav(loc.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (e) {
      setError(errorMessage(e, "Invalid username or password."));
    }
  };
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand">
          <span className="brand-mark">
            <Boxes />
          </span>
          <strong>StockFlow</strong>
        </div>
        <div className="login-copy">
          <span className="pill">
            <Sparkles /> INVENTORY, IN PERFECT FLOW
          </span>
          <h1>
            Make every item
            <br />
            <em>count.</em>
          </h1>
          <p>
            A clear command center for stock, sales, and the decisions that keep
            your business moving.
          </p>
          <div className="benefits">
            <span>
              <CheckCircle2 /> Live inventory visibility
            </span>
            <span>
              <CheckCircle2 /> Smarter sales operations
            </span>
            <span>
              <CheckCircle2 /> Role-based access control
            </span>
          </div>
        </div>
        <div className="visual-card">
          <div>
            <small>INVENTORY HEALTH</small>
            <strong>94.8%</strong>
          </div>
          <div className="mini-bars">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span>
            <b /> All systems operational
          </span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <span className="mobile-brand">
            <span className="brand-mark">
              <Boxes />
            </span>
            StockFlow
          </span>
          <div className="secure">
            <ShieldCheck /> Secure workspace
          </div>
          <h2>Welcome back</h2>
          <p>Sign in with your inventory account to continue.</p>
          <LoginForm onSubmit={submit} error={error} />
          <footer>Protected by encrypted JWT authentication</footer>
        </div>
      </section>
    </main>
  );
}
