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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Copy, CheckCircle, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

// Definir la interfaz para el club
interface Club {
  _id: string;
  nombre: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEmployeeModal({ open, onOpenChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [exceedsLimit, setExceedsLimit] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState("");
  const [ownerClubs, setOwnerClubs] = useState<Club[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    newRole: "",
    clubId: "",
  });

  // Verificar si el usuario ha alcanzado el límite de empleados
  useEffect(() => {
    async function checkEmployeeLimit() {
      if (!open) return;
      
      setCheckingLimit(true);
      try {
        // Nueva solicitud para verificar el límite de empleados
        const { data } = await api.get("/employees/check-limit");
        setExceedsLimit(data.exceedsLimit);
      } catch (error) {
        console.error("Error al verificar límite de empleados:", error);
        // Por precaución, no mostrar el formulario si hay un error
        setExceedsLimit(true);
        toast.error("Error al verificar disponibilidad de empleados");
      } finally {
        setCheckingLimit(false);
      }
    }
    
    if (open) {
      checkEmployeeLimit();
    }
  }, [open]);

  // Consultar el endpoint para obtener los clubs del dueño
  useEffect(() => {
    async function fetchClubs() {
      if (!open || exceedsLimit) return;
      
      try {
        const { data } = await api.get("/employees/clubs");
        setOwnerClubs(data.clubs);
      } catch (error) {
        toast.error("Error al cargar los clubs");
        console.error("Error fetching clubs:", error);
      }
    }
    
    if (open && !exceedsLimit && !checkingLimit) {
      fetchClubs();
    }
  }, [open, exceedsLimit, checkingLimit]);

  // Resetear el estado cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
      newRole: "",
      clubId: "",
    });
    setAvatar(null);
    setTempPassword("");
    setFormSubmitted(false);
    setCopied(false);
  };

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
    
    // Validar los campos obligatorios
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.clubId ||
      (formData.role === "nuevo" && !formData.newRole)
    ) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role === "nuevo" ? formData.newRole : formData.role,
        clubId: formData.clubId,
        avatar: avatar,
      };
      
      const { data } = await api.post("/employees", payload);
      
      toast.success("Empleado registrado correctamente");
      setTempPassword(data.tempPassword);
      setFormSubmitted(true);
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Error al registrar el empleado"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = `
    Estimado/a ${formData.name},
    
    Has sido registrado/a en nuestro sistema como ${formData.role === "nuevo" ? formData.newRole : formData.role}.
    
    Para acceder a tu cuenta, utiliza:
    - Correo electrónico: ${formData.email}
    - Contraseña temporal: ${tempPassword}
    
    Por favor, cambia tu contraseña después del primer inicio de sesión.
    `;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success("Información copiada al portapapeles");
      
      // Resetear el estado de "copiado" después de 3 segundos
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const renderContent = () => {
    // Mostrar un indicador de carga mientras se verifica el límite
    if (checkingLimit) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Verificando disponibilidad de empleados...
          </p>
        </div>
      );
    }
    
    // Mostrar mensaje de límite excedido
    if (exceedsLimit) {
      return (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="rounded-full bg-yellow-100 p-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Límite de empleados alcanzado</h3>
            <p className="text-muted-foreground">
              Has registrado la cantidad máxima de empleados permitidos en tu plan actual.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 w-full">
            <p className="text-sm text-blue-700">
              Para añadir más empleados, por favor mejora tu plan de suscripción
              o contáctanos para un plan personalizado que se adapte a tus necesidades.
            </p>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button>
              Mejorar Plan
            </Button>
          </div>
        </div>
      );
    }
    
    // Mostrar el formulario de registro si no excede el límite
    if (!formSubmitted) {
      return (
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nuevo Empleado</DialogTitle>
            <DialogDescription>
              Agrega un nuevo miembro a tu equipo
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
                      ? formData.name.split(" ").map(n => n[0]).join("").toUpperCase()
                      : "?"
                    }
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="555-0123"
                />
              </div>
            </div>

            {/* Rol y Club */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cajero">Cajero</SelectItem>
                    <SelectItem value="preparador">Preparador</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="nuevo">Crear nuevo rol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "nuevo" && (
                <div className="grid gap-2">
                  <Label htmlFor="newRole">Nuevo Rol</Label>
                  <Input
                    id="newRole"
                    value={formData.newRole}
                    onChange={(e) => setFormData({ ...formData, newRole: e.target.value })}
                    placeholder="Ejemplo: Gerente de Ventas"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="clubId">Club Asignado</Label>
                <Select
                  value={formData.clubId}
                  onValueChange={(value) => setFormData({ ...formData, clubId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un club" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownerClubs && ownerClubs.length > 0 ? (
                      ownerClubs.map((club) => (
                        <SelectItem key={club._id} value={club._id}>
                          {club.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No tienes clubs registrados
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
                "Guardar Empleado"
              )}
            </Button>
          </DialogFooter>
        </form>
      );
    }
    
    // Mostrar los datos del empleado registrado
    return (
      <div className="flex flex-col gap-6">
        <DialogHeader>
          <DialogTitle>¡Empleado Registrado Exitosamente!</DialogTitle>
          <DialogDescription>
            Comparte estos datos con tu nuevo empleado para que pueda iniciar sesión
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback>
              {formData.name
                ? formData.name.split(" ").map(n => n[0]).join("").toUpperCase()
                : "?"
              }
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-medium">{formData.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formData.role === "nuevo" ? formData.newRole : formData.role}
          </p>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="space-y-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Correo electrónico para iniciar sesión</p>
              <p className="text-lg font-medium">{formData.email}</p>
            </div>
            
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Contraseña temporal</p>
              <p className="text-lg font-medium bg-gray-100 p-2 rounded">{tempPassword}</p>
            </div>
            
            <div className="pt-2">
              <Button
                onClick={copyToClipboard}
                className="w-full"
                variant={copied ? "outline" : "default"}
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copiado al portapapeles
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar mensaje para el empleado
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            Recuerda compartir estos datos con tu empleado para que pueda acceder al sistema. 
            Se le solicitará cambiar su contraseña en el primer inicio de sesión.
          </p>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setFormSubmitted(false);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button onClick={() => {
            resetForm();
            onOpenChange(false);
          }}>
            Finalizar
          </Button>
        </DialogFooter>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}

