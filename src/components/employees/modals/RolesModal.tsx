import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Package2, Users2, FileBarChart2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultPermissions = {
  sales: {
    create: false,
    view: false,
    cancel: false,
  },
  inventory: {
    view: false,
    adjust: false,
    transfer: false,
  },
  clients: {
    create: false,
    view: false,
    edit: false,
  },
  reports: {
    view: false,
    export: false,
  }
};

export function RolesModal({ open, onOpenChange }: Props) {
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [roles] = useState([
    { id: "1", name: "Cajero", employeeCount: 3 },
    { id: "2", name: "Preparador", employeeCount: 2 },
    { id: "3", name: "Supervisor", employeeCount: 1 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleName) {
      toast.error("El nombre del rol es obligatorio");
      return;
    }
    
    setLoading(true);
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Rol creado correctamente");
      setRoleName("");
      setPermissions(defaultPermissions);
      setActiveTab("list");
    } catch (error) {
      toast.error("Error al crear el rol");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Rol eliminado correctamente");
    } catch (error) {
      toast.error("Error al eliminar el rol");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gestión de Roles</DialogTitle>
          <DialogDescription>
            Crea y administra los roles de tu equipo
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Rol
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Roles Existentes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roleName">Nombre del Rol</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Ej: Cajero Senior"
                />
              </div>

              <div className="space-y-4">
                <Label>Permisos</Label>

                {/* Ventas */}
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Ventas</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-create"
                        checked={permissions.sales.create}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            sales: { ...permissions.sales, create: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="sales-create">Registrar ventas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-view"
                        checked={permissions.sales.view}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            sales: { ...permissions.sales, view: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="sales-view">Ver historial de ventas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sales-cancel"
                        checked={permissions.sales.cancel}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            sales: { ...permissions.sales, cancel: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="sales-cancel">Cancelar ventas</Label>
                    </div>
                  </div>
                </div>

                {/* Inventario */}
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Inventario</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-view"
                        checked={permissions.inventory.view}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            inventory: { ...permissions.inventory, view: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="inventory-view">Ver inventario</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-adjust"
                        checked={permissions.inventory.adjust}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            inventory: { ...permissions.inventory, adjust: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="inventory-adjust">Ajustar stock</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inventory-transfer"
                        checked={permissions.inventory.transfer}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            inventory: { ...permissions.inventory, transfer: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="inventory-transfer">Transferir productos</Label>
                    </div>
                  </div>
                </div>

                {/* Clientes */}
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Users2 className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Clientes</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clients-create"
                        checked={permissions.clients.create}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            clients: { ...permissions.clients, create: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="clients-create">Registrar clientes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clients-view"
                        checked={permissions.clients.view}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            clients: { ...permissions.clients, view: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="clients-view">Ver clientes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="clients-edit"
                        checked={permissions.clients.edit}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            clients: { ...permissions.clients, edit: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="clients-edit">Editar clientes</Label>
                    </div>
                  </div>
                </div>

                {/* Reportes */}
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <FileBarChart2 className="h-5 w-5 text-primary" />
                    <h4 className="font-medium">Reportes</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reports-view"
                        checked={permissions.reports.view}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            reports: { ...permissions.reports, view: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="reports-view">Ver reportes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reports-export"
                        checked={permissions.reports.export}
                        onCheckedChange={(checked) =>
                          setPermissions({
                            ...permissions,
                            reports: { ...permissions.reports, export: checked as boolean }
                          })
                        }
                      />
                      <Label htmlFor="reports-export">Exportar reportes</Label>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Crear Rol"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {role.employeeCount} empleados
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}