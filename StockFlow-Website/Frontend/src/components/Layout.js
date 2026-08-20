import { useState } from "react";
import { Bot } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
const titles = {
  dashboard: "Dashboard",
  products: "Products",
  sales: "Sales",
  inventory: "Inventory",
  reports: "Report",
  insights: "AI Insights",
  users: "Users",
  settings: "Settings",
};
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { pathname } = useLocation();
  const page = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const title = titles[page] || "Dashboard";
  return (
    <div className="app-shell">
      <Sidebar {...{ collapsed, setCollapsed, mobileOpen, setMobileOpen }} />
      <div className={`main-shell ${collapsed ? "wide" : ""}`}>
        <Topbar
          title={title}
          onMenu={() => setMobileOpen(true)}
          query={query}
          setQuery={setQuery}
        />
        <main>
          <Outlet context={{ query }} />
        </main>
      </div>
      {["ADMIN", "MANAGER"].includes(user?.role) &&
        pathname !== "/insights" && (
          <Link className="ai-float" to="/insights" title="Ask StockFlow AI">
            <Bot />
            <span>Ask AI</span>
          </Link>
        )}
      {mobileOpen && (
        <div className="overlay" onClick={() => setMobileOpen(false)} />
      )}
    </div>
  );
}
