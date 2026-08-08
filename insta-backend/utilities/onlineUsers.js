const onlineUsers = new Map();

const addUser = (userId, socketId) => {
  onlineUsers.set(userId.toString(), socketId);
};

const removeUser = (socketId) => {
  let removedUserId = null;

  for (const [userId, id] of onlineUsers.entries()) {
    if (id === socketId) {
      removedUserId = userId;

      // Only remove if this socket is still
      // the user's currently registered socket.
      if (onlineUsers.get(userId) === socketId) {
        onlineUsers.delete(userId);
      }

      break;
    }
  }

  return removedUserId;
};

const getUserSocket = (userId) => {
  return onlineUsers.get(userId.toString());
};

const getOnlineUsers = () => {
  return [...onlineUsers.keys()];
};

module.exports = {
  addUser,
  removeUser,
  getUserSocket,
  getOnlineUsers,
};
