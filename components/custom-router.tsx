// components/custom-router.tsx

import type React from "react"

interface CustomRouterProps {
  children: React.ReactNode
}

const CustomRouter: React.FC<CustomRouterProps> = ({ children }) => {
  // In a real implementation, this component would manage the current route
  // and render the appropriate content based on the route.

  return (
    <>
      {/* Assurons-nous que le composant CustomRouter n'interfère pas avec l'affichage de la Navbar */}
      {/* Si le composant CustomRouter modifie la structure de la page, assurons-nous qu'il préserve la Navbar */}
      {children}
    </>
  )
}

// Exporter à la fois comme exportation par défaut et comme exportation nommée
export default CustomRouter
export { CustomRouter }
