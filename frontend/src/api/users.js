import { apiRequest } from "./client";

export async function fetchUsers() {
  return apiRequest("/users");
}

export async function fetchUserMeta() {
  return apiRequest("/users/meta");
}

export async function createUser(payload) {
  return apiRequest("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
