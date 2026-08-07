const { getIO } = require("./socket");
const { getUserSocket } = require("./onlineUsers");

const sendNotification = (userId, data) => {
  const io = getIO();

  const socketId = getUserSocket(userId);

  if (socketId) {
    io.to(socketId).emit("newNotification", data);
  }
};

module.exports = {
  sendNotification,
};
