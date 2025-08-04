"use client"

import { useOrganization } from "@/lib/providers/organization-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function OrganizationSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization()

  if (organizations.length <= 1) return null

  return (
    <Select
      value={currentOrganization?.id}
      onValueChange={(id) => {
        const org = organizations.find((o) => o.id === id) || null
        setCurrentOrganization(org)
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Organisation" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

