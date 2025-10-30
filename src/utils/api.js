// src/utils/api.js
export async function fetchWithToken(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. Please login.");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errMsg = `${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}
