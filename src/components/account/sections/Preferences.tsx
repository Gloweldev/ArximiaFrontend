import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell,
  Globe,
  Sun,
  Moon,
  Monitor,
  Loader2,
  PackageSearch,
  Receipt,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

export function Preferences() {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    language: "es",
    theme: "system",
    notifications: {
      stockAlerts: true,
      paymentReminders: true,
      weeklyReports: true
    }
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Preferencias actualizadas correctamente");
    } catch (error) {
      toast.error("Error al actualizar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Language Settings */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Idioma</CardTitle>
            <CardDescription>
              Selecciona el idioma de la interfaz
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.language}
            onValueChange={(value) => setPreferences({ ...preferences, language: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Sun className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Tema</CardTitle>
            <CardDescription>
              Personaliza la apariencia de la aplicación
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                preferences.theme === "light"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/30"
              }`}
              onClick={() => setPreferences({ ...preferences, theme: "light" })}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Claro</span>
            </button>

            <button
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                preferences.theme === "dark"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/30"
              }`}
              onClick={() => setPreferences({ ...preferences, theme: "dark" })}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Oscuro</span>
            </button>

            <button
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                preferences.theme === "system"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-primary/30"
              }`}
              onClick={() => setPreferences({ ...preferences, theme: "system" })}
            >
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">Sistema</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>
              Configura las alertas que deseas recibir
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <PackageSearch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <Label className="font-medium">Alertas de stock</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones cuando el inventario esté bajo
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.stockAlerts}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      stockAlerts: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="font-medium">Recordatorios de pagos</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas sobre pagos pendientes y vencimientos
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.paymentReminders}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      paymentReminders: checked
                    }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <Label className="font-medium">Resúmenes semanales</Label>
                  <p className="text-sm text-muted-foreground">
                    Reportes de ventas y métricas importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.notifications.weeklyReports}
                onCheckedChange={(checked) =>
                  setPreferences({
                    ...preferences,
                    notifications: {
                      ...preferences.notifications,
                      weeklyReports: checked
                    }
                  })
                }
              />
            </div>
          </div>

          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Preferencias"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}