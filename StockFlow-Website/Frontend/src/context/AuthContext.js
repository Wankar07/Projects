import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { TOKEN_KEY } from "../services/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
const normalizeRole = (role) =>
  String(role || "")
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();
const normalizeUser = (user) =>
  user ? { ...user, role: normalizeRole(user.role) } : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return normalizeUser(JSON.parse(localStorage.getItem("sim_user")));
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(
    Boolean(localStorage.getItem(TOKEN_KEY)),
  );

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setChecking(false);
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => {
        const profile = normalizeUser(data);
        setUser(profile);
        localStorage.setItem("sim_user", JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("sim_user");
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    const profile = normalizeUser({
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    });
    setUser(profile);
    localStorage.setItem("sim_user", JSON.stringify(profile));
    return profile;
  };
  const register = async (fullName, username, password) => {
    const { data } = await api.post("/auth/register", {
      fullName,
      username,
      password,
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    const profile = normalizeUser({
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    });
    setUser(profile);
    localStorage.setItem("sim_user", JSON.stringify(profile));
    return profile;
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("sim_user");
    setUser(null);
  };
  const value = useMemo(
    () => ({
      user,
      checking,
      login,
      register,
      logout,
      canManage: ["ADMIN", "MANAGER"].includes(user?.role),
      isAdmin: user?.role === "ADMIN",
    }),
    [user, checking],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
