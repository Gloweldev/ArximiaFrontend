import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./AuthLayout";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Se ha enviado un email con instrucciones para recuperar tu contraseña.");
    } catch (err: any) {
      setError(err.response?.data.message || "Error al enviar el email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Ingresa tu email para recibir instrucciones"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        
        {message && (
          <p className="text-sm text-green-600 text-center">{message}</p>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar instrucciones"
          )}
        </Button>

        <div className="text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}