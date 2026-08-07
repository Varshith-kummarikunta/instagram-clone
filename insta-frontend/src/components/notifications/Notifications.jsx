import { useContext, useEffect, useState } from "react";
import { AuthContext, BASE_URL } from "../../contexts/AuthContext";
import { FaHeart, FaUserPlus, FaComment } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { socket } from "../../socket";

export const Notifications = () => {
  const { user } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);

  const [open, setOpen] = useState(false);

  async function loadNotifications() {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setNotifications(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function markRead(id) {
    try {
      await fetch(`${BASE_URL}/notifications/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const handleNotification = () => {
      loadNotifications();
    };

    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };
  }, [user]);

  const unread = notifications.filter((n) => !n.read).length;

  function getMessage(notification) {
    if (notification.type === "follow") {
      return (
        <>
          <b>{notification.sender.username}</b>
          {" started following you"}
        </>
      );
    }

    if (notification.type === "like") {
      return (
        <>
          <b>{notification.sender.username}</b>
          {" liked your post"}
        </>
      );
    }

    if (notification.type === "comment") {
      return (
        <>
          <b>{notification.sender.username}</b>
          {" commented on your post"}
        </>
      );
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-4 w-full cursor-pointer"
      >
        <div className="relative">
          <CiHeart size={28} />

          {unread > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1">
              {unread}
            </span>
          )}
        </div>

        <div>Notifications</div>
      </button>

      {open && (
        <div className="absolute left-10 top-0 mt-3 w-80 max-h-[450px] overflow-y-auto notification-scroll bg-[#222] border border-gray-700 rounded-lg z-50 shadow-xl">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-400">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => markRead(notification._id)}
                className={`p-4 border-b border-gray-700 cursor-pointer ${
                  !notification.read ? "bg-gray-800" : ""
                }`}
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={
                      notification.sender.profilePicture ||
                      "https://ui-avatars.com/api/?name=user"
                    }
                    className="w-10 h-10 rounded-full"
                  />

                  <p>{getMessage(notification)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
