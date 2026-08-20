import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Button, Field } from "./UI";
export default function LoginForm({ onSubmit, error }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit} className="login-form">
      <Field label="Username">
        <div className="input-icon">
          <UserRound />
          <input
            autoFocus
            autoComplete="username"
            required
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Password">
        <div className="input-icon">
          <LockKeyhole />
          <input
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label="Toggle password"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </Field>
      <div className="form-row">
        <label className="checkbox">
          <input type="checkbox" /> Remember me
        </label>
        <span>JWT secured access</span>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Button disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="spin" />
            Signing in…
          </>
        ) : (
          "Sign in to workspace"
        )}
      </Button>
      <p className="auth-switch">
        New to StockFlow? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
