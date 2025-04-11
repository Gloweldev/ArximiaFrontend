import { useState, useEffect, useRef } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Key, Loader2 } from "lucide-react";
import api from "@/services/api";

export function Security() {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  const intervalRef = useRef<number>();

  // Al montar, recuperar lockUntil de localStorage
  useEffect(() => {
    const stored = localStorage.getItem("passwordLockUntil");
    if (stored) {
      const date = new Date(stored);
      if (date > new Date()) {
        setLockUntil(date);
      } else {
        localStorage.removeItem("passwordLockUntil");
      }
    }
  }, []);

  // Guardar / limpiar lockUntil en localStorage
  useEffect(() => {
    if (lockUntil) {
      localStorage.setItem("passwordLockUntil", lockUntil.toISOString());
    } else {
      localStorage.removeItem("passwordLockUntil");
    }
  }, [lockUntil]);

  // Contador regresivo
  useEffect(() => {
    if (!lockUntil) {
      clearInterval(intervalRef.current);
      setCountdown("");
      return;
    }
    const tick = () => {
      const now = new Date();
      const diff = lockUntil.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(intervalRef.current);
        setLockUntil(null);
        toast("Ya puedes volver a intentar cambiar contraseña");
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
    };
    tick();
    intervalRef.current = window.setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [lockUntil]);

  const handleChange = (field: keyof typeof passwords, val: string) =>
    setPasswords(p => ({ ...p, [field]: val }));
  const toggleShow = (field: keyof typeof show) =>
    setShow(s => ({ ...s, [field]: !s[field] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await api.put("/users/me/password", {
        currentPassword: passwords.current,
        newPassword: passwords.new,
        confirmPassword: passwords.confirm
      });
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Error al actualizar";
      // Errores específicos
      if (status === 400) {
        toast.error(msg); // p.ej. "Contraseña actual incorrecta"
      } else if (status === 429) {
        toast.error(msg); // p.ej. "Demasiados intentos..."
        if (err.response.data.lockUntil) {
          setLockUntil(new Date(err.response.data.lockUntil));
        }
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = Boolean(lockUntil);

  return (
    <Card className="max-w-md mx-auto p-6 bg-white/90 dark:bg-neutral-900/60 rounded-2xl shadow-lg backdrop-blur-lg">
      <CardHeader className="flex items-center gap-3 pb-4">
        <Key className="h-6 w-6 text-primary" />
        <div>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu contraseña actual y define una nueva.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLocked && (
            <p className="text-center text-destructive">
              Demasiados intentos. Vuelve a intentarlo en {countdown}.
            </p>
          )}

          {/* Contraseña actual */}
          <div className="relative">
            <Label htmlFor="current">Contraseña actual</Label>
            <Input
              id="current"
              type={show.current ? "text" : "password"}
              value={passwords.current}
              onChange={e => handleChange("current", e.target.value)}
              disabled={loading || isLocked}
            />
            <button
              type="button"
              onClick={() => toggleShow("current")}
              className="absolute right-2 top-9"
            >
              {show.current ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Nueva contraseña */}
          <div className="relative">
            <Label htmlFor="new">Nueva contraseña</Label>
            <Input
              id="new"
              type={show.new ? "text" : "password"}
              value={passwords.new}
              onChange={e => handleChange("new", e.target.value)}
              disabled={loading || isLocked}
            />
            <button
              type="button"
              onClick={() => toggleShow("new")}
              className="absolute right-2 top-9"
            >
              {show.new ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              type={show.confirm ? "text" : "password"}
              value={passwords.confirm}
              onChange={e => handleChange("confirm", e.target.value)}
              disabled={loading || isLocked}
            />
            <button
              type="button"
              onClick={() => toggleShow("confirm")}
              className="absolute right-2 top-9"
            >
              {show.confirm ? <EyeOff /> : <Eye />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || isLocked}
          >
            {loading
              ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              : "Actualizar Contraseña"
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

