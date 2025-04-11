// src/components/auth/Login.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Eye, EyeOff, Option } from "lucide-react";
import api from "@/services/api";
// Importamos el hook del ClubContext
import { useClub } from "@/context/ClubContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setActiveClub } = useClub(); // Actualizar el club activo en el estado global

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await api.post("/auth/login", { email, password });
      // Se guarda el token para autenticar futuras peticiones
      localStorage.setItem("token", response.data.token);
      // Se actualiza el club activo en el estado global utilizando el clubPrincipal recibido en la respuesta
      if(response.data.clubPrincipal){
        setActiveClub(response.data.clubPrincipal);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] dark:bg-neutral-950 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        {/* Logo and Title Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-6 scale-in-center">
            <div className="h-12 w-12 bg-gradient-to-br from-primary/90 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-primary/20">
              <Option className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white fade-in-bottom">
            Arximia
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 fade-in-bottom animation-delay-100">
            Gestión inteligente para tu negocio
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-black/5 p-8 space-y-6 fade-in-bottom animation-delay-200">
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                Correo electrónico
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-colors group-hover:text-primary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-colors group-hover:text-primary" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 transition-all duration-200 hover:border-primary/50 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>

            <div className="space-y-3 text-center">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                ¿No tienes cuenta?{" "}
                <Link 
                  to="/register" 
                  className="text-primary hover:text-purple-600 transition-colors font-medium hover:underline"
                >
                  Regístrate
                </Link>
              </p>
              <Link 
                to="/forgot-password"
                className="text-sm text-primary hover:text-purple-600 transition-colors font-medium hover:underline block"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-8 fade-in-bottom animation-delay-300">
          © 2025 Arximia. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
