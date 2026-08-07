import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const AuthContext = createContext(undefined);
const BASE_URL = import.meta.env.VITE_API_URL;
const LS_KEY = "user_details";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem(LS_KEY)) || null,
  );

  const [onlineStatus, setOnlineStatus] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
  if (!user) return;

  socket.connect();

  socket.on("connect", () => {
    console.log("Socket Connected:", socket.id);

    socket.emit("join", user._id);
  });

  socket.on("onlineUsers", (users) => {
  const status = {};

  users.forEach((id) => {
    status[id] = true;
  });

  setOnlineStatus(status);
});

socket.on("userOnline", (userId) => {
  setOnlineStatus((prev) => ({
    ...prev,
    [userId]: true,
  }));
});

socket.on("userOffline", (userId) => {
  setOnlineStatus((prev) => ({
    ...prev,
    [userId]: false,
  }));
});

  return () => {
  socket.off("connect");
  socket.off("onlineUsers");
  socket.off("userOnline");
  socket.off("userOffline");
  socket.disconnect();
};
}, [user]);
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
    socket.disconnect();
    localStorage.removeItem(LS_KEY);
    setUser(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider
  value={{
    user,
    setUser,
    login,
    signup,
    logout,
    onlineStatus,
  }}
>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, BASE_URL };
