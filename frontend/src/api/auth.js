import {
  apiRequest,
  clearAuthToken,
  hasAuthToken,
  setAuthToken,
} from "./client";

export async function login(username, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
}

export async function fetchMe() {
  return apiRequest("/auth/me");
}

export { clearAuthToken, hasAuthToken, setAuthToken };
