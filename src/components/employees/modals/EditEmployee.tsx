import { useState, useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api"; // Asegúrate de ajustar la ruta a tu configuración de Axios

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any | null;
}

export function EditEmployeeModal({ open, onOpenChange, employee }: Props) {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);

  // Se agrega el campo isActive para controlar la activación/desactivación
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    store: "",
    isActive: true,
  });

  // Obtención de las tiendas (clubs) del dueño
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await api.get("/clubs");
        setClubs(response.data.clubs || []);
      } catch (error) {
        console.error("Error al cargar las tiendas:", error);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchClubs();
  }, []);

  // Autocompletar el formulario con la información del empleado
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role.toLowerCase(),
        store: employee.club ? employee.club._id : employee.store,
        isActive: employee.isActive !== undefined ? employee.isActive : true,
      });
      setAvatar(employee.avatar);
    }
  }, [employee]);

  // Uso de useMemo para fusionar la tienda asignada con la lista obtenida
  const mergedClubs = useMemo(() => {
    if (!employee || !formData.store) return clubs;
    const exists = clubs.some((club) => club._id === formData.store);
    return exists ? clubs : [...clubs, { _id: formData.store, nombre: employee.club ? employee.club.nombre : employee.store }];
  }, [employee, formData.store, clubs]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role || !formData.store) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const updatedEmployee = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        club: formData.store,
        isActive: formData.isActive,  // Enviar el estado de activación al backend
        avatar,
      };

      await api.patch(`/employees/${employee._id || employee.id}`, updatedEmployee);
      toast.success("Empleado actualizado correctamente");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al actualizar el empleado:", error);
      toast.error("Error al actualizar el empleado");
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>
              Modifica la información del empleado
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback>
                    {formData.name
                      ? formData.name.split(" ").map(n => n[0]).join("")
                      : "?"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Haz clic en el ícono de cámara para cambiar la foto
              </p>
            </div>

            {/* Información Personal */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Rol y Tienda Asignada */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cajero">Cajero</SelectItem>
                    <SelectItem value="preparador">Preparador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="store">Tienda Asignada</Label>
                <Select
                  value={formData.store}
                  onValueChange={(value) =>
                    setFormData({ ...formData, store: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una tienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingClubs ? (
                      <SelectItem value="">Cargando...</SelectItem>
                    ) : (
                      mergedClubs.map((club: any) => (
                        <SelectItem key={club._id} value={club._id}>
                          {club.nombre}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Estado de la cuenta */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Estado de la cuenta</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa / Desactivada
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
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
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}