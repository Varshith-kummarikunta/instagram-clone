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

export async function sendMessage(receiverId, text, imageUrl, replyTo, token) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiverId,
      text,
      imageUrl,
      replyTo,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

export async function markMessagesSeen(senderId, token) {
  const res = await fetch(`${BASE_URL}/messages/seen/${senderId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to mark seen");
  }

  return res.json();
}

export async function deleteMessage(messageId, token) {
  const res = await fetch(`${BASE_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json();

    throw new Error(data.message || "Failed to delete message");
  }

  return res.json();
}

export async function editMessage(messageId, text, token) {
  const res = await fetch(`${BASE_URL}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      text,
    }),
  });

  if (!res.ok) {
    const data = await res.json();

    throw new Error(data.message || "Failed to edit message");
  }

  return res.json();
}


export async function toggleReaction(messageId, emoji, token) {
  const res = await fetch(
    `${BASE_URL}/messages/${messageId}/reaction`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        emoji,
      }),
    },
  );

  if (!res.ok) {
    const data = await res.json();

    throw new Error(
      data.message || "Failed to update reaction",
    );
  }

  return res.json();
}