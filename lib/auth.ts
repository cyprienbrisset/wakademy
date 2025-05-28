// Simple auth utility for demo purposes
import { syncAuthOnLogin } from "./auth-sync"

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false

  try {
    const adminData = localStorage.getItem("wakademy_admin")
    if (!adminData) return false

    const admin = JSON.parse(adminData)
    return admin.isAuthenticated === true
  } catch (error) {
    console.error("Auth check error:", error)
    return false
  }
}

export const getUser = () => {
  if (typeof window === "undefined") return null

  try {
    const adminData = localStorage.getItem("wakademy_admin")
    if (!adminData) return null

    return JSON.parse(adminData)
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

export const login = (userData: any) => {
  if (typeof window === "undefined") return

  const adminData = {
    ...userData,
    isAuthenticated: true,
  }

  localStorage.setItem("wakademy_admin", JSON.stringify(adminData))

  // Synchroniser avec les cookies
  syncAuthOnLogin(adminData)

  return adminData
}

export const logout = () => {
  if (typeof window === "undefined") return

  localStorage.removeItem("wakademy_admin")

  // Supprimer le cookie
  document.cookie = "wakademy_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

  window.location.href = "/"
}
