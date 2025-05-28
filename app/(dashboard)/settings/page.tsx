import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettings } from "@/components/settings/general-settings"
import { AdminAccountSettings } from "@/components/settings/admin-account-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { OrganizationSettings } from "@/components/settings/organization-settings"
import { UICustomizationSettings } from "@/components/settings/ui-customization-settings"
import { ContentManagementSettings } from "@/components/settings/content-management-settings"
import { AIAutomationSettings } from "@/components/settings/ai-automation-settings"
import { IntegrationsSettings } from "@/components/settings/integrations-settings"
import { StatisticsSettings } from "@/components/settings/statistics-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Configurez votre instance Wakademy selon vos besoins.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="account">Compte Admin</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="ui">Interface</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="statistics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <AdminAccountSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="organization" className="space-y-4">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="ui" className="space-y-4">
          <UICustomizationSettings />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentManagementSettings />
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <AIAutomationSettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <StatisticsSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
