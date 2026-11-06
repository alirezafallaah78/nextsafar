import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
})

/* ─── اضافه کردن توکن به هر درخواست ─── */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ─── گارد: فقط یک‌بار redirect به login ─── */
let loggingOut = false

function forceLogout() {
  if (typeof window === "undefined") return
  if (window.location.pathname.startsWith("/login")) {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    return
  }
  if (loggingOut) return
  loggingOut = true
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  window.location.href = "/login"
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true
      forceLogout()
    }
    return Promise.reject(error)
  }
)

export default api
