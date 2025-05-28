"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAdminLogsData } from "@/lib/admin/mock-data"
import { Upload, Trash, Edit, UserPlus, Settings, Download, Eye } from "lucide-react"

export function AdminLogsTable() {
  const logs = getAdminLogsData()

  const getActionIcon = (action: string) => {
    switch (action) {
      case "upload":
        return <Upload className="h-4 w-4" />
      case "delete":
        return <Trash className="h-4 w-4" />
      case "edit":
        return <Edit className="h-4 w-4" />
      case "user_add":
        return <UserPlus className="h-4 w-4" />
      case "settings":
        return <Settings className="h-4 w-4" />
      case "export":
        return <Download className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "upload":
        return "bg-green-50 text-green-700 border-green-200"
      case "delete":
        return "bg-red-50 text-red-700 border-red-200"
      case "edit":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "user_add":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "settings":
        return "bg-gray-50 text-gray-700 border-gray-200"
      case "export":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Date & Heure</TableHead>
            <TableHead>Administrateur</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.timestamp}</TableCell>
              <TableCell>{log.admin}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`flex items-center w-fit gap-1 ${getActionColor(log.action)}`}>
                  {getActionIcon(log.action)}
                  {log.actionLabel}
                </Badge>
              </TableCell>
              <TableCell>{log.description}</TableCell>
              <TableCell className="font-mono text-xs">{log.ip}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
