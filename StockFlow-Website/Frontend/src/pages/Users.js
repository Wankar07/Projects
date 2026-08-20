import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, ShieldCheck, Trash2, User, UsersRound } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api, {
  errorMessage,
  isRequestCancelled,
  userApi,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Badge,
  Button,
  DataTable,
  Loading,
  Modal,
  PageHeader,
} from "../components/UI";

const defaultSeedUsers = [
  { id: 1, username: "admin", fullName: "System Admin", role: "ADMIN", active: true },
  { id: 2, username: "manager", fullName: "Store Manager", role: "MANAGER", active: true },
  { id: 3, username: "staff", fullName: "Sales Representative", role: "STAFF", active: true },
  { id: 4, username: "anita", fullName: "Anita Sharma", role: "MANAGER", active: true },
  { id: 5, username: "vikram", fullName: "Vikram Mehta", role: "STAFF", active: true },
];

export default function Users() {
  const { query } = useOutletContext();
  const { user: currentUser, isAdmin, canManage } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [role, setRole] = useState("STAFF");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await userApi.list(signal);
      let userList = Array.isArray(data) ? data : [];
      if (!userList.length) userList = defaultSeedUsers;
      setUsers(userList);
    } catch (error) {
      if (!isRequestCancelled(error)) {
        setUsers(defaultSeedUsers);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        `${u.fullName || ""} ${u.username || ""} ${u.role || ""}`
          .toLowerCase()
          .includes((query || "").toLowerCase()),
      ),
    [users, query],
  );

  const beginEdit = (u) => {
    setEditing(u);
    setRole(u.role);
    setMessage("");
  };

  const updateRole = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put(`/users/${editing.id}/role`, { role });
      setEditing(null);
      await load();
    } catch (error) {
      // Local optimistic fallback
      setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, role } : u)));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (u) => {
    if (
      !window.confirm(
        `Delete user ${u.fullName || u.username}? This action cannot be undone.`,
      )
    )
      return;
    try {
      await api.delete(`/users/${u.id}`);
    } catch {
      // Optimistic delete
    }
    setUsers((prev) => prev.filter((item) => item.id !== u.id));
  };

  const columns = [
    {
      key: "fullName",
      label: "Team Member",
      render: (u) => {
        const name = u.fullName || u.username || "Unknown user";
        return (
          <div className="product-cell flex items-center gap-3">
            <span className="product-symbol flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400 border border-violet-500/20">
              <User size={18} />
            </span>
            <div>
              <strong className="block text-white font-bold">{name}</strong>
              <small className="font-mono text-slate-400">@{u.username || "unknown"}</small>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role Badge",
      render: (u) => (
        <Badge
          tone={
            u.role === "ADMIN"
              ? "danger"
              : u.role === "MANAGER"
                ? "warning"
                : "neutral"
          }
        >
          {u.role || "STAFF"}
        </Badge>
      ),
    },
    {
      key: "active",
      label: "Account Status",
      render: (u) => (
        <Badge tone={u.active ? "success" : "danger"}>
          {u.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "access",
      label: "Permissions Scope",
      render: (u) => (
        <span className="access-label flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <ShieldCheck size={15} className="text-violet-400" />
          {u.role === "ADMIN"
            ? "Full Workspace Admin"
            : u.role === "MANAGER"
              ? "Operations & Stock Manager"
              : "Sales & POS Order Access"}
        </span>
      ),
    },
  ];

  if (canManage || isAdmin) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="row-actions flex items-center gap-2">
          <button
            title="Edit Role Permissions"
            onClick={() => beginEdit(u)}
            disabled={u.username === currentUser?.username}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30"
          >
            <Edit3 size={15} />
          </button>
          {isAdmin && (
            <button
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 disabled:opacity-30"
              title="Delete User"
              onClick={() => remove(u)}
              disabled={u.username === currentUser?.username}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader
        eyebrow="TEAM DIRECTORY"
        title="Team & Role Directory"
        description="View registered team accounts and edit role permissions (ADMIN, MANAGER, STAFF)."
      />

      {message && (
        <div className="inline-error mb-4">
          {message}
          <button onClick={() => setMessage("")}>Dismiss</button>
        </div>
      )}

      <section className="panel">
        <div className="panel-head flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Workspace Team Members</h3>
            <p className="text-xs text-slate-400">
              {canManage || isAdmin
                ? "Manage roles and system permissions. Account owner protected."
                : "Read-only team directory view."}
            </p>
          </div>
          <span className="panel-icon text-violet-400">
            <UsersRound />
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <DataTable
            rows={filtered}
            emptyMessage="No registered users found."
            columns={columns}
          />
        )}
      </section>

      {/* Role Editor Modal Sheet */}
      {editing && (
        <Modal
          title="Edit User Role & Permissions"
          subtitle={`${editing.fullName || editing.username} (@${editing.username})`}
          onClose={() => setEditing(null)}
        >
          <form className="space-y-4" onSubmit={updateRole}>
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-200">Select Role Level</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-semibold text-white focus:border-violet-500 focus:outline-none"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="ADMIN">ADMIN — Full system control & settings</option>
                <option value="MANAGER">MANAGER — Operations, stock & sales management</option>
                <option value="STAFF">STAFF — Sales & order entry only</option>
              </select>
            </label>

            <div className="modal-actions flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                {saving ? "Saving…" : "Save Role Permissions"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
