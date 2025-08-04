"use client"

import { memo, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  Bell,
  User,
  Menu,
  X,
  Home,
  Library,
  Clock,
  Heart,
  History,
  Settings,
  LayoutDashboard,
  Video,
  Headphones,
  FileText,
  Briefcase,
  BookOpen,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import Image from "next/image"

function NavbarComponent() {
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  // Gestion du défilement pour l'effet de transparence uniquement
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY
      setScrolled(currentScrollPos > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev)
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const isAdmin = true // This would be determined by user role

  // Ne pas afficher la navbar uniquement sur la page d'accueil
  if (pathname === "/") {
    return null
  }

  // Ne pas rendre le composant côté serveur pour éviter l'hydratation
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b w-full bg-background h-16">
        <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="flex items-center space-x-2">
              <div>
                <Image src="/wakademy-logo.png" alt="Wakademy" width={32} height={32} className="rounded-lg" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">
                Wakademy
              </span>
            </a>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b w-full transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
          : "bg-background"
      )}
    >
      {/* Navbar principale - toujours visible */}
      <div className="flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto w-full">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div>
              <Image src="/wakademy-logo.png" alt="Wakademy" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">
              Wakademy
            </span>
          </Link>
          <OrganizationSwitcher />
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          {isSearchOpen ? (
            <div className="flex items-center space-x-2 w-full">
              <Input type="search" placeholder="Rechercher du contenu..." className="w-full h-9" autoFocus />
              <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Icons - Desktop */}
        <div className="hidden lg:flex items-center space-x-1">
          {/* Home */}
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                pathname === "/dashboard" ? "bg-muted text-primary" : "hover:bg-muted/50",
              )}
            >
              <Home className="h-4 w-4" />
              {pathname === "/dashboard" && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          </Link>

          {/* Library Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 relative",
                  pathname.startsWith("/library") ? "bg-muted text-primary" : "hover:bg-muted/50",
                )}
              >
                <Library className="h-4 w-4" />
                {pathname.startsWith("/library") && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bibliothèque</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/library" className="flex items-center space-x-2">
                  <Library className="h-4 w-4" />
                  <span>Tout voir</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?type=video" className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span>Vidéos</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?type=podcast" className="flex items-center space-x-2">
                  <Headphones className="h-4 w-4" />
                  <span>Podcasts</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/library?type=document" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Catégories</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem asChild>
                    <Link href="/library?category=business" className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Business</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library?category=formation" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Formation</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library?category=marketing" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Marketing Digital</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Continue Watching */}
          <Link href="/continue-watching">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                pathname === "/continue-watching" ? "bg-muted text-primary" : "hover:bg-muted/50",
              )}
            >
              <Clock className="h-4 w-4" />
              {pathname === "/continue-watching" && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          </Link>

          {/* Favorites */}
          <Link href="/favorites">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                pathname === "/favorites" ? "bg-muted text-primary" : "hover:bg-muted/50",
              )}
            >
              <Heart className="h-4 w-4" />
              {pathname === "/favorites" && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          </Link>

          {/* History */}
          <Link href="/history">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                pathname === "/history" ? "bg-muted text-primary" : "hover:bg-muted/50",
              )}
            >
              <History className="h-4 w-4" />
              {pathname === "/history" && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          </Link>

          {/* Admin Options (if admin) */}
          {isAdmin && (
            <>
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 relative",
                    pathname === "/admin" ? "bg-muted text-primary" : "hover:bg-muted/50",
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {pathname === "/admin" && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>

              <Link href="/upload">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 relative",
                    pathname === "/upload" ? "bg-muted text-primary" : "hover:bg-muted/50",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  {pathname === "/upload" && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2">
          {/* Search for mobile */}
          <div className="md:hidden">
            {isSearchOpen ? (
              <div className="flex items-center space-x-2">
                <Input type="search" placeholder="Rechercher..." className="w-32 h-9" autoFocus />
                <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleSearch} className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings */}
          <Link href="/settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 relative",
                pathname === "/settings" ? "bg-muted text-primary" : "hover:bg-muted/50",
              )}
            >
              <Settings className="h-4 w-4" />
              {pathname === "/settings" && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Préférences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="flex flex-col space-y-1 p-4">
            <Link
              href="/dashboard"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                pathname === "/dashboard" ? "text-primary bg-muted" : "text-muted-foreground",
              )}
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </Link>

            <Link
              href="/library"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                pathname.startsWith("/library") ? "text-primary bg-muted" : "text-muted-foreground",
              )}
            >
              <Library className="h-4 w-4" />
              <span>Bibliothèque</span>
            </Link>

            <Link
              href="/continue-watching"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                pathname === "/continue-watching" ? "text-primary bg-muted" : "text-muted-foreground",
              )}
            >
              <Clock className="h-4 w-4" />
              <span>À reprendre</span>
            </Link>

            <Link
              href="/favorites"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                pathname === "/favorites" ? "text-primary bg-muted" : "text-muted-foreground",
              )}
            >
              <Heart className="h-4 w-4" />
              <span>Favoris</span>
            </Link>

            <Link
              href="/history"
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                pathname === "/history" ? "text-primary bg-muted" : "text-muted-foreground",
              )}
            >
              <History className="h-4 w-4" />
              <span>Historique</span>
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-border/50 my-2" />
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                    pathname === "/admin" ? "text-primary bg-muted" : "text-muted-foreground",
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin</span>
                </Link>

                <Link
                  href="/upload"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-md",
                    pathname === "/upload" ? "text-primary bg-muted" : "text-muted-foreground",
                  )}
                >
                  <Upload className="h-4 w-4" />
                  <span>Ajouter du contenu</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

// Exporter le composant correctement
export default memo(NavbarComponent)
export const Navbar = memo(NavbarComponent)
