import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Boxes, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import RegisterForm from "../components/RegisterForm";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../services/api";
export default function Register() {
  const { user, register } = useAuth();
  const [error, setError] = useState("");
  const nav = useNavigate();
  if (user) return <Navigate to="/dashboard" replace />;
  const submit = async (f) => {
    setError("");
    try {
      await register(f.fullName, f.username, f.password);
      nav("/dashboard", { replace: true });
    } catch (e) {
      setError(errorMessage(e, "Account creation failed."));
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
            <Sparkles /> JOIN YOUR OPERATIONS HUB
          </span>
          <h1>
            Start with
            <br />
            <em>clarity.</em>
          </h1>
          <p>
            Create your staff account and get immediate access to inventory,
            sales, and stock activity.
          </p>
          <div className="benefits">
            <span>
              <CheckCircle2 /> Secure BCrypt credentials
            </span>
            <span>
              <CheckCircle2 /> Automatic staff access
            </span>
            <span>
              <CheckCircle2 /> JWT-protected workspace
            </span>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box register-box">
          <span className="mobile-brand">
            <span className="brand-mark">
              <Boxes />
            </span>
            StockFlow
          </span>
          <div className="secure">
            <ShieldCheck /> Secure registration
          </div>
          <h2>Create account</h2>
          <p>Your new account will be assigned the Staff role.</p>
          <RegisterForm onSubmit={submit} error={error} />
          <footer>Protected by encrypted JWT authentication</footer>
        </div>
      </section>
    </main>
  );
}
