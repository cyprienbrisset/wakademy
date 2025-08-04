"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Organization {
  id: string
  name: string
}

interface OrganizationContextValue {
  organizations: Organization[]
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization | null) => void
}

const OrganizationContext = createContext<OrganizationContextValue>({
  organizations: [],
  currentOrganization: null,
  setCurrentOrganization: () => {},
})

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return
        const { data, error } = await supabase
          .from("organization_members")
          .select("organizations(id,name)")
          .eq("user_id", user.id)
        if (!error && data) {
          const orgs = data.map((item: any) => item.organizations as Organization)
          setOrganizations(orgs)
          setCurrentOrganization(orgs[0] || null)
        }
      } catch (err) {
        console.error("Failed to load organizations", err)
      }
    }
    load()
  }, [])

  return (
    <OrganizationContext.Provider value={{ organizations, currentOrganization, setCurrentOrganization }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  return useContext(OrganizationContext)
}

