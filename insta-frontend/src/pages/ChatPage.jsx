import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getConversations } from "../api/conversation";
import { getMessages, sendMessage, markMessagesSeen } from "../api/message";
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
        setMessages((prev) => [...prev, message]);

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

        let updated;

        if (exists) {
          updated = prev.map((conversation) =>
            conversation._id === conversationId
              ? {
                  ...conversation,
                  lastMessage: message.text,
                  lastMessageAt: message.createdAt,
                  unreadCount:
                    selectedConversation?._id === conversationId
                      ? 0
                      : (conversation.unreadCount || 0) + 1,
                }
              : conversation,
          );
        } else {
          getConversations(user.token)
            .then((data) => {
              setConversations(data);
            })
            .catch(console.error);

          return prev;
        }

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

  async function handleSend() {
    if (!text.trim()) return;

    try {
      const otherUser = selectedConversation.members.find(
        (m) => m._id !== user._id,
      );

      const message = await sendMessage(otherUser._id, text, user.token);

      setMessages((prev) => [...prev, message]);

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
                lastMessage: text,
                lastMessageAt: message.createdAt,
                unreadCount: 0,
              }
            : conversation,
        );

        updated.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
        );

        return updated;
      });

      setText("");
    } catch (err) {
      console.log(err);
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

                    {onlineStatus[otherUser?._id] ? (
                      <span className="text-green-500 text-sm">● Online</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Offline</span>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
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
                      <div>{message.text}</div>

                      <div className="text-[10px] opacity-70 text-right mt-1 flex items-center justify-end gap-1">
  <span>{formatTime(message.createdAt)}</span>

  {(message.sender._id || message.sender) === user._id && (
    <span className={message.seen ? "text-blue-400" : "text-gray-400"}>
      ✓✓
    </span>
  )}
</div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>

            <div className="border-t border-gray-700 p-4 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 bg-[#222] rounded-lg p-3 outline-none"
                placeholder="Message..."
              />

              <button
                className="bg-blue-600 px-5 rounded-lg"
                onClick={handleSend}
              >
                Send
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
