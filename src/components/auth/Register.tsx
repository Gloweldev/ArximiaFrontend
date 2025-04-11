import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "./AuthLayout";
import { User, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import api from "@/services/api";

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password)) strength += 25;
  if (/[^A-Za-z0-9]/.test(password)) strength += 25;
  return strength;
}

function getStrengthColor(strength: number): string {
  if (strength <= 25) return "destructive";
  if (strength <= 50) return "orange-500";
  if (strength <= 75) return "yellow-500";
  return "green-500";
}

export default function Register() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("El email debe ser válido");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setIsLoading(true);

    try {
      const fullName = [nombres, apellidos];
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
        termsAccepted,
      });

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/onboarding");
      } else {
        setError("No se recibió el token de autenticación");
      }
    } catch (err: any) {
      setError(err.response?.data.message || "Error en el registro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Comienza a gestionar tu negocio de nutrición"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombres">Nombres</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="nombres"
              type="text"
              placeholder="Ej: Juan Carlos"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidos">Apellidos</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="apellidos"
              type="text"
              placeholder="Ej: Pérez García"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {password && (
            <div className="space-y-1">
              <Progress
                value={passwordStrength}
                className={`h-1 bg-muted bg-${getStrengthColor(passwordStrength)}`}
              />
              <p className="text-xs text-muted-foreground">
                Fortaleza de la contraseña: {passwordStrength}%
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
          />
          <Label
            htmlFor="terms"
            className="text-sm leading-none"
          >
            Acepto los{" "}
            <Link
              to="/terms"
              target="_blank"
              className="text-primary hover:underline"
            >
              términos y condiciones
            </Link>
          </Label>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrarse"
          )}
        </Button>

        <p className="text-sm text-center text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}