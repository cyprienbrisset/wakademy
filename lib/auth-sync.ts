"use client"

import { useEffect } from "react"

export function useAuthSync() {
  useEffect(() => {
    // Synchroniser localStorage avec les cookies au chargement
    syncAuthState()

    // Ajouter un écouteur d'événements pour les changements de localStorage
    window.addEventListener("storage", syncAuthState)

    return () => {
      window.removeEventListener("storage", syncAuthState)
    }
  }, [])
}

function syncAuthState() {
  try {
    // Récupérer les données d'authentification depuis localStorage
    const adminData = localStorage.getItem("wakademy_admin")

    if (adminData) {
      // Définir un cookie avec les mêmes données
      document.cookie = `wakademy_admin=${adminData}; path=/; max-age=86400; SameSite=Strict`
    } else {
      // Supprimer le cookie si les données n'existent pas dans localStorage
      document.cookie = "wakademy_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation de l'état d'authentification:", error)
  }
}

export function syncAuthOnLogin(userData: any) {
  try {
    const adminData = JSON.stringify(userData)

    // Mettre à jour localStorage
    localStorage.setItem("wakademy_admin", adminData)

    // Mettre à jour le cookie
    document.cookie = `wakademy_admin=${adminData}; path=/; max-age=86400; SameSite=Strict`
  } catch (error) {
    console.error("Erreur lors de la synchronisation après connexion:", error)
  }
}
