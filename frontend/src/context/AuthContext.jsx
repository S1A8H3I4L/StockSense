import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("stocksense_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("stocksense_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        sessionStorage.setItem(
          "stocksense_user",
          JSON.stringify(res.data)
        );
      })
      .catch(() => {
        sessionStorage.removeItem("stocksense_token");
        sessionStorage.removeItem("stocksense_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    sessionStorage.setItem("stocksense_token", res.data.token);
    sessionStorage.setItem("stocksense_user", JSON.stringify(res.data));

    setUser(res.data);

    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    sessionStorage.setItem("stocksense_token", res.data.token);
    sessionStorage.setItem("stocksense_user", JSON.stringify(res.data));

    setUser(res.data);

    return res.data;
  };

  const logout = () => {
    sessionStorage.removeItem("stocksense_token");
    sessionStorage.removeItem("stocksense_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);