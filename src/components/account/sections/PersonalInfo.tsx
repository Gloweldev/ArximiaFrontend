import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

export function PersonalInfo() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{
    displayName: string;
    nombre: string;
    email: string;
    role: string;
    clubs: { id: string; nombre: string }[];
    clubPrincipal: string;
  }>({
    displayName: "",
    nombre: "",
    email: "",
    role: "",
    clubs: [],
    clubPrincipal: "",
  });

  // Opciones para el select de club principal
  const [clubsOptions, setClubsOptions] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/users/me");
        setProfile({
          displayName: data.displayName,
          nombre: data.nombre,
          email: data.email,
          role: data.role,
          clubs: data.clubs,
          clubPrincipal: data.clubPrincipal,
        });
        setClubsOptions(data.clubs);
      } catch {
        toast.error("No se pudo cargar el perfil");
      }
    }
    load();
  }, []);

  const handleChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/me", {
        nombre: profile.nombre,
        email: profile.email,
        clubPrincipal: profile.clubPrincipal,
      });
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 bg-white/90 dark:bg-neutral-900/60 rounded-2xl shadow-lg backdrop-blur-lg">
      {/* HEADER */}
      <CardHeader className="pb-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" /> {/* puedes cargar avatar si lo tienes */}
            <AvatarFallback>
              {profile.displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{profile.displayName}</CardTitle>
          <CardDescription className="text-gray-500">
            Aquí puedes ver y editar tu información personal
          </CardDescription>
        </div>
      </CardHeader>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre completo */}
            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={profile.nombre}
                onChange={e => handleChange("nombre", e.target.value)}
              />
            </div>

            {/* Correo */}
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={e => handleChange("email", e.target.value)}
              />
            </div>

            {/* Puesto (solo lectura) */}
            <div className="md:col-span-2">
              <Label>Puesto</Label>
              <p className="mt-1 font-medium text-lg">
                {profile.role === "admin"
                  ? "Dueño del club"
                  : profile.role}
              </p>
            </div>

            {/* Clubs asignados */}
            <div className="md:col-span-2">
              <Label>Clubs asignados</Label>
              <p className="text-xs text-gray-500 mb-2">
                Estos son todos los clubs en los que participas.
              </p>
              <ul className="list-disc list-inside space-y-1">
                {clubsOptions.map(c => (
                  <li key={c.id}>{c.nombre}</li>
                ))}
              </ul>
            </div>

            {/* Club principal */}
            <div className="md:col-span-2">
              <Label htmlFor="clubPrincipal">Club principal</Label>
              <p className="text-xs text-gray-500 mb-2">
                Selecciona el club que verás primero al iniciar sesión.
              </p>
              <select
                id="clubPrincipal"
                value={profile.clubPrincipal}
                onChange={e => handleChange("clubPrincipal", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring"
              >
                <option value="">— Ninguno —</option>
                {clubsOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading
                ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
