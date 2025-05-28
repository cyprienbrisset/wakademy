import { Download, RefreshCw, Upload } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function AdminPage() {
  return (
    <div>
      <div className="flex items-center justify-between space-x-2">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
          <Button size="sm" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" variant="default" asChild>
            <Link href="/upload">
              <Upload className="h-4 w-4 mr-2" />
              Ajouter du contenu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
