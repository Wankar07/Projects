import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  IdCard,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import { Button, Field } from "./UI";

export default function RegisterForm({ onSubmit, error }) {
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setLocalError("");
    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit} className="login-form">
      <Field label="Full name">
        <div className="input-icon">
          <IdCard />
          <input
            autoFocus
            required
            maxLength="100"
            autoComplete="name"
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Username">
        <div className="input-icon">
          <UserRound />
          <input
            required
            minLength="3"
            maxLength="50"
            autoComplete="username"
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Password">
        <div className="input-icon">
          <LockKeyhole />
          <input
            required
            minLength="8"
            maxLength="72"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 8 characters"
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
      <Field label="Confirm password">
        <div className="input-icon">
          <LockKeyhole />
          <input
            required
            minLength="8"
            maxLength="72"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
          />
        </div>
      </Field>
      {(localError || error) && (
        <p className="form-error" role="alert">
          {localError || error}
        </p>
      )}
      <Button disabled={loading}>
        {loading ? (
          <>
            <LoaderCircle className="spin" />
            Creating account…
          </>
        ) : (
          "Create staff account"
        )}
      </Button>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
