import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function Topbar({ title, onMenu, query, setQuery }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const loadNotifications = useCallback(async () => {
    const [salesResult, productsResult] = await Promise.allSettled([
      api.get("/sales/recent"),
      api.get("/products"),
    ]);
    const sales =
      salesResult.status === "fulfilled" &&
      Array.isArray(salesResult.value.data)
        ? salesResult.value.data
        : [];
    const products =
      productsResult.status === "fulfilled" &&
      Array.isArray(productsResult.value.data)
        ? productsResult.value.data
        : [];
    setNotifications([
      ...products
        .filter((p) => Number(p.stockQuantity) <= Number(p.lowStockThreshold))
        .slice(0, 5)
        .map((p) => ({
          id: `stock-${p.id}`,
          type: "stock",
          title: `Low stock: ${p.name}`,
          detail: `${p.stockQuantity} left · threshold ${p.lowStockThreshold}`,
        })),
      ...sales
        .slice(0, 5)
        .map((s) => ({
          id: `sale-${s.id}`,
          type: "sale",
          title: `New sale ${s.invoiceNumber || `#${s.id}`}`,
          detail: `${s.customerName || "Walk-in customer"} · ${money(s.totalAmount)}`,
        })),
    ]);
  }, []);
  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("stockflow-theme", theme);
  }, [theme]);
  useEffect(() => {
    const focusSearch = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);
  return (
    <header className="topbar">
      <div className="title-wrap">
        <button
          className="icon-btn menu-btn"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu />
        </button>
        <div>
          <span className="eyebrow">OPERATIONS / OVERVIEW</span>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="top-actions">
        <label className="search">
          <Search size={17} />
          <input
            ref={searchRef}
            value={query || ""}
            onChange={(event) => setQuery?.(event.target.value)}
            placeholder="Search this page…"
            aria-label={`Search ${title}`}
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery?.("")}
              aria-label="Clear search"
            >
              <X />
            </button>
          ) : (
            <kbd>Ctrl K</kbd>
          )}
        </label>
        <div className="notification-wrap">
          <button
            className="icon-btn notification"
            onClick={() => setOpen((value) => !value)}
            aria-label={`${notifications.length} notifications`}
            aria-expanded={open}
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <span className="notification-count">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>
          {open && (
            <section className="notification-panel">
              <div className="notification-head">
                <div>
                  <span className="eyebrow">LIVE UPDATES</span>
                  <h3>Notifications</h3>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="notification-list">
                {notifications.length ? (
                  notifications.map((item) => (
                    <article className="notification-item" key={item.id}>
                      <i className={item.type}>
                        {item.type === "stock" ? (
                          <AlertTriangle />
                        ) : (
                          <ShoppingBag />
                        )}
                      </i>
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.detail}</small>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="notification-empty">
                    <Bell />
                    <strong>All caught up</strong>
                    <small>No recent sales or low-stock warnings.</small>
                  </div>
                )}
              </div>
              <button
                className="notification-refresh"
                onClick={loadNotifications}
              >
                Refresh notifications
              </button>
            </section>
          )}
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="theme-toggle-icon">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </span>
          <span className="theme-toggle-text">
            {theme === "dark" ? "Light" : "Dark"}
          </span>
        </button>
        <div className="user-chip">
          <span>
            {(user?.fullName || user?.username || "U")
              .slice(0, 1)
              .toUpperCase()}
          </span>
          <div>
            <strong>{user?.fullName || user?.username}</strong>
            <small>{user?.role}</small>
          </div>
        </div>
        <button className="logout-btn" onClick={logout} title="Log out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
