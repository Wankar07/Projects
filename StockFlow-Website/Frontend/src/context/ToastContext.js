import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const entry = {
      id,
      title: toast.title || "Success",
      message: toast.message || "",
      tone: toast.tone || "success",
    };

    setToasts((current) => [...current, entry]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <article className={`toast toast-${toast.tone}`} key={toast.id}>
            <div className="toast-icon">
              {toast.tone === "success" ? (
                <CheckCircle2 size={18} />
              ) : toast.tone === "error" ? (
                <AlertTriangle size={18} />
              ) : (
                <Info size={18} />
              )}
            </div>
            <div className="toast-copy">
              <strong>{toast.title}</strong>
              {toast.message && <small>{toast.message}</small>}
            </div>
            <button
              className="toast-close"
              type="button"
              onClick={() =>
                setToasts((current) => current.filter((item) => item.id !== toast.id))
              }
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </article>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      pushToast: () => undefined,
    };
  }
  return context;
}
