"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GeneralSettings } from "./general-settings"
import { AdminAccountSettings } from "./admin-account-settings"
import { SecuritySettings } from "./security-settings"
import { OrganizationSettings } from "./organization-settings"
import { UICustomizationSettings } from "./ui-customization-settings"
import { ContentManagementSettings } from "./content-management-settings"
import { AIAutomationSettings } from "./ai-automation-settings"
import { IntegrationsSettings } from "./integrations-settings"
import { StatisticsSettings } from "./statistics-settings"
import { Settings, User, Shield, Building, Palette, FileText, Brain, Plug, BarChart3 } from "lucide-react"

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { id: "general", label: "Général", icon: Settings, component: GeneralSettings },
    { id: "account", label: "Compte Admin", icon: User, component: AdminAccountSettings },
    { id: "security", label: "Sécurité", icon: Shield, component: SecuritySettings },
    { id: "organization", label: "Organisation", icon: Building, component: OrganizationSettings },
    { id: "ui", label: "Interface", icon: Palette, component: UICustomizationSettings },
    { id: "content", label: "Contenu", icon: FileText, component: ContentManagementSettings },
    { id: "ai", label: "IA & Auto", icon: Brain, component: AIAutomationSettings },
    { id: "integrations", label: "Intégrations", icon: Plug, component: IntegrationsSettings },
    { id: "statistics", label: "Statistiques", icon: BarChart3, component: StatisticsSettings },
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex flex-col items-center gap-1 p-3 text-xs">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </CardTitle>
                <CardDescription>Configurez les paramètres de {tab.label.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <tab.component />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
