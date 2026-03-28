/**
 * API base URL for fetch().
 * - If REACT_APP_API_URL is set → use it (hosted / remote API).
 * - In development with no env → use Flask directly on 127.0.0.1:5000 (avoids CRA proxy issues with FormData).
 * - In production build with no env → "" so paths are same-origin (set REACT_APP_API_URL when deploying).
 */
const raw = (process.env.REACT_APP_API_URL || "").trim().replace(/\/$/, "");

export const isUserConfiguredRemoteApi = Boolean(raw);

const API_BASE_URL =
  raw ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:5000" : "");

export default API_BASE_URL;

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${p}` : p;
}
