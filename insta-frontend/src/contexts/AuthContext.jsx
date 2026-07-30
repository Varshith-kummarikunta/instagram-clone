import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);
const BASE_URL = import.meta.env.VITE_API_URL;
const LS_KEY = "user_details";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem(LS_KEY)) || null,
  );
  const navigate = useNavigate();

  async function login(identifier, password) {
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setUser(data);
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      navigate("/");
    } catch (err) {
      console.log(err.message);
    }
  }

  async function signup(newUser) {
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setUser(data);
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  function logout() {
    localStorage.removeItem(LS_KEY);
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, BASE_URL };
