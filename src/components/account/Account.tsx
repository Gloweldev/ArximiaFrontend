import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfo } from "./sections/PersonalInfo";
import { Security } from "./sections/Security";
import { Preferences } from "./sections/Preferences";
import { Subscription } from "./sections/Subscription";
import { UserCircle } from "lucide-react";

export default function Account() {
  const [activeTab, setActiveTab] = useState("personal");
  const isOwner = true; // TODO: Get from auth context

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
            <UserCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Mi Cuenta
            </h1>
            <p className="text-muted-foreground">
              Gestiona tu perfil y preferencias
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-none">
            <TabsTrigger value="personal" className="min-w-fit">Información Personal</TabsTrigger>
            <TabsTrigger value="security" className="min-w-fit">Seguridad</TabsTrigger>
            <TabsTrigger value="preferences" className="min-w-fit">Preferencias</TabsTrigger>
            {isOwner && <TabsTrigger value="subscription" className="min-w-fit">Suscripción</TabsTrigger>}
          </TabsList>

          <div className="px-1">
            <TabsContent value="personal" className="space-y-4 animate-in fade-in-50">
              <PersonalInfo />
            </TabsContent>

            <TabsContent value="security" className="space-y-4 animate-in fade-in-50">
              <Security />
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 animate-in fade-in-50">
              <Preferences />
            </TabsContent>

            {isOwner && (
              <TabsContent value="subscription" className="space-y-4 animate-in fade-in-50">
                <Subscription />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}