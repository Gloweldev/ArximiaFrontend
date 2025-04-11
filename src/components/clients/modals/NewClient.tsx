// components/clientes/CreateClientModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Mail, Phone } from "lucide-react";
import { useClub } from "@/context/ClubContext";
import api from "@/services/api";

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function NewClientModal({
  open,
  onOpenChange,
  onSave,
}: CreateClientModalProps) {
  const { activeClub } = useClub();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "regular",
  });
  const [loading, setLoading] = useState(false);

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

    if (!activeClub) {
      toast.error("No se ha seleccionado un club activo");
      return;
    }

    setLoading(true);
    try {
      // Enviar la data incluyendo el club activo
      await api.post("/clients", { ...formData, clubId: activeClub });
      toast.success("Cliente creado correctamente");
      if (onSave) onSave();
      onOpenChange(false);
      // Reiniciar el formulario si es necesario
      setFormData({ name: "", email: "", phone: "", type: "regular" });
    } catch (error) {
      toast.error("Error al crear el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Cliente</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo cliente
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de cliente</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
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
              {loading ? "Guardando..." : "Guardar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
