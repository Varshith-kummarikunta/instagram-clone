import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getConversations } from "../api/conversation";
import {
  getMessages,
  sendMessage,
  markMessagesSeen,
  deleteMessage,
  editMessage,
  toggleReaction,
} from "../api/message";
import { socket } from "../socket";
import { useLocation } from "react-router-dom";
import { useRef } from "react";

export const ChatPage = () => {
    
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user, onlineStatus } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [reactionMessageId, setReactionMessageId] = useState(null);

  const messagesEndRef = useRef(null);

  function formatTime(date) {
    if (!date) return "";

    const now = new Date();
    const msgDate = new Date(date);

    const diff = Math.floor((now - msgDate) / 1000);

    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return msgDate.toLocaleDateString();
  }

  useEffect(() => {
    if (location.state?.conversation) {
      setSelectedConversation(location.state.conversation);

      setConversations((prev) => {
        const exists = prev.some(
          (c) => c._id === location.state.conversation._id,
        );

        if (exists) return prev;

        return [location.state.conversation, ...prev];
      });
    }
  }, [location]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConversations(user.token);

        console.log(JSON.stringify(data, null, 2));

        const validConversations = data.filter(
          (conversation) => conversation.members?.length === 2,
        );

        setConversations(validConversations);

        // Auto open conversation after clicking Message button
        if (location.state?.conversation) {
          const exists = validConversations.find(
            (c) => c._id === location.state.conversation._id,
          );

          setSelectedConversation(exists || location.state.conversation);
        }
      } catch (err) {
        console.log(err);
      }
    }

    if (user) {
      load();
    }
  }, [user]);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) return;

      try {
        const otherUser = selectedConversation.members.find(
          (m) => m._id !== user._id,
        );

        const data = await getMessages(otherUser._id, user.token);

console.log("MESSAGES FROM API:", data);

setMessages(data);

        await markMessagesSeen(otherUser._id, user.token);

        setConversations((prev) =>
          prev.map((conversation) =>
            conversation._id === selectedConversation._id
              ? {
                  ...conversation,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      } catch (err) {
        console.log(err);
      }
    }

    loadMessages();
  }, [selectedConversation, user]);

  useEffect(() => {
    const handleMessage = ({ conversationId, message }) => {
  if (selectedConversation?._id === conversationId) {
    setMessages((prev) => {
      // Prevent duplicate messages
      const alreadyExists = prev.some(
        (existingMessage) => existingMessage._id === message._id,
      );

      if (alreadyExists) {
        return prev;
      }

      return [...prev, message];
    });

    const otherUser = selectedConversation.members.find(
      (m) => m._id !== user._id,
    );

    if (otherUser) {
      markMessagesSeen(otherUser._id, user.token).catch(console.error);
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  }

  setConversations((prev) => {
    const exists = prev.some(
      (conversation) => conversation._id === conversationId,
    );

    if (!exists) {
      return prev;
    }

    const updated = prev.map((conversation) =>
      conversation._id === conversationId
        ? {
            ...conversation,
            lastMessage: message.imageUrl ? "📷 Photo" : message.text,
            lastMessageAt: message.createdAt,
            unreadCount:
              selectedConversation?._id === conversationId
                ? 0
                : (conversation.unreadCount || 0) + 1,
          }
        : conversation,
    );

    updated.sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );

    return updated;
  });
};

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [selectedConversation]);

  useEffect(() => {
    const handleSeen = () => {
      setMessages((prev) =>
        prev.map((message) =>
          (message.sender._id || message.sender) === user._id
            ? { ...message, seen: true }
            : message,
        ),
      );
    };

    socket.on("messagesSeen", handleSeen);

    return () => {
      socket.off("messagesSeen", handleSeen);
    };
  }, [user]);


useEffect(() => {
  const handleMessageDeleted = ({ messageId }) => {
    console.log("MESSAGE DELETED SOCKET RECEIVED:", messageId);

    setMessages((prev) =>
      prev.filter(
        (message) => message._id.toString() !== messageId.toString(),
      ),
    );
  };

  const handleMessageEdited = ({ messageId, text, edited }) => {
    console.log("MESSAGE EDITED SOCKET RECEIVED:", {
      messageId,
      text,
      edited,
    });

    setMessages((prev) =>
      prev.map((message) =>
        message._id.toString() === messageId.toString()
          ? {
              ...message,
              text,
              edited: true,
            }
          : message,
      ),
    );
  };

  const handleMessageReaction = ({ messageId, reactions }) => {
    console.log("REACTION SOCKET RECEIVED:", {
      messageId,
      reactions,
    });

    setMessages((prev) =>
      prev.map((message) =>
        message._id.toString() === messageId.toString()
          ? {
              ...message,
              reactions: reactions || [],
            }
          : message,
      ),
    );
  };

  socket.on("messageDeleted", handleMessageDeleted);
  socket.on("messageEdited", handleMessageEdited);
  socket.on("messageReaction", handleMessageReaction);

  return () => {
    socket.off("messageDeleted", handleMessageDeleted);
    socket.off("messageEdited", handleMessageEdited);
    socket.off("messageReaction", handleMessageReaction);
  };
}, []);

  useEffect(() => {
    const handleUserTyping = ({ senderId }) => {
      if (!selectedConversation) return;

      const otherUser = selectedConversation.members.find(
        (m) => m._id !== user._id,
      );

      if (senderId === otherUser?._id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ senderId }) => {
      if (!selectedConversation) return;

      const otherUser = selectedConversation.members.find(
        (m) => m._id !== user._id,
      );

      if (senderId === otherUser?._id) {
        setIsTyping(false);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [selectedConversation, user]);

  async function uploadChatImage(file) {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );

    setUploadingImage(true);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Image upload failed");
      }

      setSelectedImage(data.secure_url);
      setImagePreview(data.secure_url);
    } catch (err) {
      console.log(err);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDeleteMessage(messageId) {
    try {
      await deleteMessage(messageId, user.token);

      // Remove immediately from current user's screen
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId),
      );
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  }

  function startEditingMessage(message) {
    if (message.imageUrl && !message.text) return;

    setEditingMessageId(message._id);
    setEditingText(message.text || "");
  }

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setEditingText("");
  }

  async function handleEditMessage(messageId) {
  const newText = editingText.trim();

  if (!newText) return;

  try {
    const result = await editMessage(
      messageId,
      newText,
      user.token,
    );

    setMessages((prev) =>
      prev.map((message) =>
        message._id === messageId
          ? {
              ...message,
              text: result.updatedMessage.text,
              edited: result.updatedMessage.edited,
            }
          : message,
      ),
    );

    setEditingMessageId(null);
    setEditingText("");
  } catch (err) {
    console.error("EDIT MESSAGE ERROR:", err);
    alert(err.message);
  }
}

 async function handleReaction(messageId, emoji) {
  try {
    const result = await toggleReaction(
      messageId,
      emoji,
      user.token,
    );

    console.log("REACTION API RESULT:", result);

    setMessages((prev) =>
      prev.map((message) =>
        message._id.toString() === messageId.toString()
          ? {
              ...message,
              reactions: result.reactions || [],
            }
          : message,
      ),
    );

    setReactionMessageId(null);
  } catch (err) {
    console.error("REACTION ERROR:", err);
    alert(err.message);
  }
}

 async function handleSend() {
  if (!text.trim() && !selectedImage) return;
  if (!selectedConversation) return;

  try {
    const otherUser = selectedConversation.members.find(
      (m) => m._id !== user._id,
    );

    if (!otherUser) return;

    socket.emit("stopTyping", {
      receiverId: otherUser._id,
      senderId: user._id,
    });

    const message = await sendMessage(
      otherUser._id,
      text,
      selectedImage,
      replyingTo?._id || null,
      user.token,
    );

    // Add the message immediately to sender's chat
    setMessages((prev) => {
      // Prevent duplicate message
      if (prev.some((m) => m._id === message._id)) {
        return prev;
      }

      return [...prev, message];
    });

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);

    setConversations((prev) => {
      const updated = prev.map((conversation) =>
        conversation._id === selectedConversation._id
          ? {
              ...conversation,
              lastMessage: message.imageUrl
                ? "📷 Photo"
                : message.text,
              lastMessageAt: message.createdAt,
              unreadCount: 0,
            }
          : conversation,
      );

      updated.sort(
        (a, b) =>
          new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
      );

      return updated;
    });

    // Clear input
    setText("");
    setSelectedImage(null);
    setImagePreview("");
    setReplyingTo(null);
  } catch (err) {
    console.log("SEND MESSAGE ERROR:", err);
  }
}
  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-700">
        <h2 className="text-2xl font-bold p-4">Messages</h2>

        <div>
          {conversations.map((conversation) => {
            const otherUser = conversation.members.find(
              (m) => m._id !== user._id,
            );

            return (
              <div
                key={conversation._id}
                className="p-4 border-b border-gray-700 cursor-pointer hover:bg-[#1d1d1d]"
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      otherUser?.profilePicture ||
                      "https://ui-avatars.com/api/?name=user"
                    }
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <div className="flex justify-between items-center">
                      <div className="font-semibold">
                        {otherUser?.username || "Unknown User"}
                      </div>

                      {conversation.unreadCount > 0 && (
                        <div
                          className="bg-blue-500 text-white text-xs
    w-5 h-5 rounded-full
    flex items-center justify-center"
                        >
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="text-gray-400 text-sm flex gap-2">
                      <span className="truncate max-w-[150px]">
                        {conversation.lastMessage || "Start chatting"}
                      </span>

                      <span>{formatTime(conversation.lastMessageAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 h-screen">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-700 p-4">
              {(() => {
                const otherUser = selectedConversation.members.find(
                  (m) => m._id !== user._id,
                );

                return (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{otherUser?.username}</span>

                    {isTyping ? (
                      <span className="text-blue-400 text-sm">● Typing...</span>
                    ) : onlineStatus[otherUser?._id] ? (
                      <span className="text-green-500 text-sm">● Online</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Offline</span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => {
                

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      (message.sender._id || message.sender) === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-sm ${
                        (message.sender._id || message.sender) === user._id
                          ? "bg-blue-600"
                          : "bg-gray-700"
                      }`}
                    >
                      <div>
                        {message.replyTo && (
                          <div className="mb-2 border-l-2 border-gray-400 bg-black/20 rounded-md px-3 py-2 text-xs">
                            <div className="font-semibold text-gray-300">
                              {message.replyTo.sender?.username || "User"}
                            </div>

                            {message.replyTo.imageUrl && (
                              <img
                                src={message.replyTo.imageUrl}
                                alt="Replied message"
                                className="w-16 h-16 object-cover rounded mt-1"
                              />
                            )}

                            {message.replyTo.text && (
                              <div className="text-gray-400 truncate max-w-[220px]">
                                {message.replyTo.text}
                              </div>
                            )}
                          </div>
                        )}

                        {message.imageUrl && (
                          <img
                            src={message.imageUrl}
                            alt="Message"
                            className="max-w-[280px] max-h-[350px] rounded-xl object-cover mb-1"
                          />
                        )}

                        {editingMessageId === message._id ? (
                          <div className="space-y-2">
                            <input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-[#111] text-white rounded-lg px-3 py-2 outline-none border border-gray-600"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditMessage(message._id);
                                }

                                if (e.key === "Escape") {
                                  cancelEditingMessage();
                                }
                              }}
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMessage(message._id)}
                                className="text-xs bg-green-600 px-3 py-1 rounded"
                              >
                                Save
                              </button>

                              <button
                                onClick={cancelEditingMessage}
                                className="text-xs bg-gray-600 px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {message.text}

                            {message.edited && (
                              <span className="text-[10px] text-gray-300 ml-2">
                                edited
                              </span>
                            )}
                          </div>
                        )}

                        {message.reactions?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(
                              message.reactions.reduce((groups, reaction) => {
                                groups[reaction.emoji] =
                                  (groups[reaction.emoji] || 0) + 1;

                                return groups;
                              }, {}),
                            ).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  handleReaction(message._id, emoji)
                                }
                                className="bg-black/30 border border-gray-600 rounded-full px-2 py-1 text-xs hover:bg-black/50"
                              >
                                {emoji} {count > 1 && count}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() =>
                              setReactionMessageId(
                                reactionMessageId === message._id
                                  ? null
                                  : message._id,
                              )
                            }
                            className="text-xs text-gray-300 hover:text-white"
                          >
                            😊 React
                          </button>

                          <button
                            onClick={() => setReplyingTo(message)}
                            className="text-xs text-gray-300 hover:text-white"
                          >
                            Reply
                          </button>

                          {(message.sender._id || message.sender) ===
                            user._id && (
                            <>
                              {message.text && (
                                <button
                                  onClick={() => startEditingMessage(message)}
                                  className="text-xs text-yellow-300 hover:text-yellow-100"
                                >
                                  Edit
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="text-xs text-red-300 hover:text-red-100"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>

                        {reactionMessageId === message._id && (
                          <div className="flex items-center gap-2 mt-2 bg-[#111] rounded-full px-3 py-2 w-fit">
                            {["❤️", "😂", "👍", "😮", "😢"].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() =>
                                  handleReaction(message._id, emoji)
                                }
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="text-[10px] opacity-70 text-right mt-1 flex items-center justify-end gap-1">
                          <span>{formatTime(message.createdAt)}</span>

                          {(message.sender._id || message.sender) ===
                            user._id && (
                            <span
                              className={
                                message.seen ? "text-blue-400" : "text-gray-400"
                              }
                            >
                              {message.seen ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}></div>
            </div>

            {imagePreview && (
              <div className="border-t border-gray-700 p-3">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview("");
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="border-t border-gray-700 px-4 py-3 bg-[#181818]">
                <div className="flex justify-between items-start">
                  <div className="border-l-2 border-blue-500 pl-3">
                    <div className="text-sm text-blue-400 font-semibold">
                      Replying to {replyingTo.sender?.username || "message"}
                    </div>

                    {replyingTo.imageUrl && (
                      <img
                        src={replyingTo.imageUrl}
                        alt="Reply preview"
                        className="w-12 h-12 object-cover rounded mt-1"
                      />
                    )}

                    {replyingTo.text && (
                      <div className="text-sm text-gray-400 truncate max-w-[300px]">
                        {replyingTo.text}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-gray-700 p-4 flex gap-2">
              <label className="bg-gray-700 px-4 rounded-lg flex items-center justify-center cursor-pointer">
                📷
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => uploadChatImage(e.target.files[0])}
                />
              </label>
              <input
                value={text}
                onChange={(e) => {
                  const value = e.target.value;
                  setText(value);

                  if (!selectedConversation) return;

                  const otherUser = selectedConversation.members.find(
                    (m) => m._id !== user._id,
                  );

                  if (!otherUser) return;

                  if (value.trim()) {
                    socket.emit("typing", {
                      receiverId: otherUser._id,
                      senderId: user._id,
                    });
                  } else {
                    socket.emit("stopTyping", {
                      receiverId: otherUser._id,
                      senderId: user._id,
                    });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onBlur={() => {
                  if (!selectedConversation) return;

                  const otherUser = selectedConversation.members.find(
                    (m) => m._id !== user._id,
                  );

                  if (otherUser) {
                    socket.emit("stopTyping", {
                      receiverId: otherUser._id,
                      senderId: user._id,
                    });
                  }
                }}
                className="flex-1 bg-[#222] rounded-lg p-3 outline-none"
                placeholder="Message..."
              />

              <button
                className="bg-blue-600 px-5 rounded-lg disabled:opacity-50"
                onClick={handleSend}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Send"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-xl">Select a conversation</div>
        )}
      </div>
    </div>
  );
};
