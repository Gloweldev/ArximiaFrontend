// components/clients/modals/EditClientModal.tsx
import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Phone } from "lucide-react";
import { Client } from "../../../types/clients";
import api from "@/services/api";
import { useClub } from "@/context/ClubContext";

interface EditClientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSave?: () => void;
}

export function EditClientModal({ open, onOpenChange, client, onSave }: EditClientProps) {
  const { activeClub } = useClub();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "regular",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        type: client.type,
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (!formData.email && !formData.phone) {
      toast.error("Debes proporcionar al menos un método de contacto");
      return;
    }

    // Obtener el id correcto (ya sea en _id o en id)
    const clientId = client!._id || client!.id;
    if (!clientId) {
      toast.error("No se pudo obtener el id del cliente");
      return;
    }

    setLoading(true);
    try {
      // Realiza la llamada PUT con el id correcto y enviando el club activo
      await api.put(`/clients/${clientId}`, { ...formData, clubId: activeClub });
      toast.success("Cliente actualizado correctamente");
      if (onSave) onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      toast.error("Error al actualizar el cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Modifica la información del cliente
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de cliente</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                  <SelectItem value="occasional">Ocasional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
