"use client"

import type React from "react"
import { useState, createContext, useContext, type ReactNode } from "react"

interface LayoutContextProps {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const LayoutContext = createContext<LayoutContextProps>({
  isSidebarOpen: false,
  toggleSidebar: () => {},
})

interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar }}>{children}</LayoutContext.Provider>
}

export const useLayout = () => useContext(LayoutContext)
