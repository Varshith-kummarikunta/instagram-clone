import { BASE_URL } from "../contexts/AuthContext";

export async function getConversations(token) {
  const res = await fetch(`${BASE_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load conversations");
  }

  return res.json();
}

export async function createConversation(receiverId, token) {
  const res = await fetch(`${BASE_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      receiverId,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to create conversation");
  }

  return res.json();
}