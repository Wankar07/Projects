import { NavLink } from "react-router-dom";
import {
  Boxes,
  ChartNoAxesCombined,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Lightbulb,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard, ["ADMIN", "MANAGER", "STAFF"]],
  ["/products", "Products", Package, ["ADMIN", "MANAGER", "STAFF"]],
  ["/sales", "Sales & Orders", ShoppingCart, ["ADMIN", "MANAGER", "STAFF"]],
  ["/inventory", "Inventory", Boxes, ["ADMIN", "MANAGER", "STAFF"]],
  ["/reports", "Report", ChartNoAxesCombined, ["ADMIN", "MANAGER", "STAFF"]],
  ["/insights", "AI Assistant", Lightbulb, ["ADMIN", "MANAGER", "STAFF"]],
  ["/users", "Team Members", Users, ["ADMIN", "MANAGER", "STAFF"]],
  ["/settings", "Settings", Settings, ["ADMIN"]],
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const { user } = useAuth();
  const userRole = user?.role || "ADMIN";

  const visibleLinks = links.filter(([, , , roles]) =>
    roles.includes(userRole),
  );

  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
    >
      <div className="brand">
        <NavLink
          to="/dashboard"
          className="brand-link"
          onClick={() => setMobileOpen(false)}
          aria-label="Go to dashboard"
        >
          <span className="brand-mark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 p-1 border border-violet-500/30 shadow-lg shadow-violet-900/40 overflow-hidden">
            <img src="/favicon.svg" alt="StockFlow Logo" className="h-full w-full object-contain" />
          </span>
          <span className="brand-copy">
            <strong className="text-lg font-bold">StockFlow</strong>
            <small className="text-[10px] font-bold tracking-widest text-violet-400">SMART INVENTORY</small>
          </span>
        </NavLink>
        <button
          className="icon-btn mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X />
        </button>
      </div>

      <nav>
        {visibleLinks.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft size={18} />
          <span>Collapse sidebar</span>
        </button>
      </div>
    </aside>
  );
}
