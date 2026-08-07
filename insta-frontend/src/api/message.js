import { BASE_URL } from "../contexts/AuthContext";

export async function getMessages(receiverId, token) {
  const res = await fetch(`${BASE_URL}/messages/${receiverId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

export async function sendMessage(receiverId, text, token) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiverId,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

export async function markMessagesSeen(senderId, token) {
  const res = await fetch(
    `${BASE_URL}/messages/seen/${senderId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to mark seen");
  }

  return res.json();
}