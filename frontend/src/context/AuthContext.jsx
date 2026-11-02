import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jobtrack_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const savedToken = localStorage.getItem("jobtrack_token");
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.auth.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Token verification failed:", error.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.auth.login({ email, password });
    if (response.success && response.token) {
      localStorage.setItem("jobtrack_token", response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || "Login failed");
  };

  const adminLogin = async (email, password) => {
    const response = await api.auth.adminLogin({ email, password });
    if (response.success && response.token) {
      localStorage.setItem("jobtrack_token", response.token);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    }
    throw new Error(response.message || "Admin login failed");
  };

  const logout = () => {
    localStorage.removeItem("jobtrack_token");
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "Admin",
    login,
    adminLogin,
    logout,
    updateProfileState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
