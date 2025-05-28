"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getActiveUsers } from "@/lib/admin/data-service"
import { Loader2 } from "lucide-react"

interface ActiveUsersTableProps {
  timeFilter: "7d" | "30d" | "90d"
  searchQuery: string
  departmentFilter: string
}

export function ActiveUsersTable({ timeFilter, searchQuery, departmentFilter }: ActiveUsersTableProps) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getActiveUsers(timeFilter)
        setUsers(data)
      } catch (error) {
        console.error("Error fetching active users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeFilter])

  // Filter users based on search query and department
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || user.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Utilisateur</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Contenus vus</TableHead>
            <TableHead className="text-right">Dernier accès</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.status === "Actif" ? "default" : "secondary"}>{user.status}</Badge>
              </TableCell>
              <TableCell className="text-right">{user.contentViewed}</TableCell>
              <TableCell className="text-right">{user.lastAccess}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
