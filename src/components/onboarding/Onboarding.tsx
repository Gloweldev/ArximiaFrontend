import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  MapPin,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Loader2,
  Building,
  Coins,
  Sun,
  Moon,
  Sparkles,
  Monitor,
  Info,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle,
  Store,
  User,
  Settings,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import api from "@/services/api";

type Step1Data = {
  clubNombre: string;
  direccion: string;
  tienesColaboradores: boolean;
  
};

type ClubData = {
  clubNombre: string;
  direccion: string;
};

type Step2Data = {
  moneda: string;
  tema: string;
};

type Step3Data = {
  metaVentasMensual: number;
  diasInventario: number;
};

type SubscriptionInfo = {
  clubsMax: number;
};

const steps = ["Configura tu club", "Configura tu perfil", "Meta y alertas"];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Parte 1: Configura tu club
  const [step1Data, setStep1Data] = useState<Step1Data>({
    clubNombre: "",
    direccion: "",
    tienesColaboradores: false,
  });
  const [additionalClub, setAdditionalClub] = useState<ClubData>({
    clubNombre: "",
    direccion: "",
  });
  const [agregarOtroClub, setAgregarOtroClub] = useState<boolean>(false);
  const [clubPrincipalSeleccionado, setClubPrincipalSeleccionado] = useState<"principal" | "adicional">("principal");
  
  // Parte 2: Configura tu perfil
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [step2Data, setStep2Data] = useState<Step2Data>({
    moneda: "MXN",
    tema: "claro",
  });
  
  // Parte 3: Meta y alertas
  const [step3Data, setStep3Data] = useState<Step3Data>({
    metaVentasMensual: 0,
    diasInventario: 0,
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [clubsCount, setClubsCount] = useState<number>(0);
  const navigate = useNavigate();

  const progress = ((currentStep) / (steps.length - 1)) * 100;

  useEffect(() => {
    setIsDarkMode(step2Data.tema === "oscuro");
  }, [step2Data.tema]);

  // Al montar, obtenemos la info de la suscripción del usuario
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await api.get("/auth/me");
        setSubscription(response.data.subscription);
        setClubsCount(response.data.clubsCount);
      } catch (err: any) {
        console.error("Error al obtener la suscripción:", err);
        setError("No se pudo obtener la información de suscripción");
      }
    };
    fetchSubscription();
  }, []);

  // Calcular si se permite agregar otro club
  const permitirAgregarOtroClub = subscription ? (clubsCount + 1 < subscription.clubsMax) : false;

  // Manejar cambios en el file input y generar preview
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setProfilePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleNext = () => {
    // Validaciones por paso
    if (currentStep === 0) { // Paso 1: Configura tu club
      if (!step1Data.clubNombre) {
        setError("El nombre del Club es obligatorio");
        return;
      }
    }
    if (currentStep === 1) { // Paso 2: Configura tu perfil
      if (!displayName) {
        setError("El nombre para mostrar es obligatorio");
        return;
      }
    }
    
    setError("");
    // Incrementa el paso actual si no es el último
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrev = () => {
    setError("");
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Para el último paso, validar campos específicos de ese paso
    if (currentStep === 2) { // Validación del Paso 3
      if (step3Data.metaVentasMensual <= 0) {
        setError("La meta de ventas debe ser mayor a 0");
        return;
      }
      if (step3Data.diasInventario <= 0) {
        setError("Los días de inventario deben ser mayor a 0");
        return;
      }
    }
    
    // Si no estamos en el último paso (2), simplemente avanzamos
    if (currentStep < 2) {
      handleNext();
      return;
    }
    
    // Si estamos en el paso 2 (último), entonces enviar el formulario
    setIsLoading(true);
    try {
      const payload = {
        step1: {
          tiendaNombre: step1Data.clubNombre,
          direccion: step1Data.direccion,
          tienesColaboradores: step1Data.tienesColaboradores,
          adicional: agregarOtroClub && permitirAgregarOtroClub ? additionalClub : null,
          clubPrincipal: clubPrincipalSeleccionado,
        },
        step2: {
          displayName,
          profilePic: profilePic ? profilePic.name : null,
          moneda: step2Data.moneda,
          tema: step2Data.tema,
        },
        step3: { 
          metaVentasMensual: step3Data.metaVentasMensual,
          diasInventario: step3Data.diasInventario,
        },
      };
      const response = await api.post("/onboarding", payload);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Actualizar el token en las cabeceras de axios para futuras peticiones
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.response?.data.message || "Hubo un problema al guardar tus datos");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTooltip = (content: string, children: React.ReactNode) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 cursor-help">
            {children}
            <HelpCircle className="h-4 w-4 text-primary/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-primary-foreground text-primary border-primary/10">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${isDarkMode ? "dark bg-[#0F172A]" : "bg-neutral-50"}`}>
      <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted/10 px-4 py-8 md:p-8 transition-all duration-500">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Encabezado */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Configuración inicial</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Arximia
            </h1>
            <p className="text-muted-foreground dark:text-neutral-300">
              Vamos a configurar tu experiencia paso a paso.
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-4">
            <div className="relative">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden dark:bg-neutral-800">
                <Progress value={progress} className="h-2.5 bg-gradient-to-r from-primary to-purple-500 transition-all duration-500" />
              </div>
              <div className="flex justify-between mt-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`h-2 w-2 rounded-full ${currentStep >= index ? "bg-primary" : "bg-muted"}`} />
                    <span className="text-xs mt-1 text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mensaje de error si existe */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative flex items-center gap-2" role="alert">
              <AlertTriangle className="h-5 w-5" />
              <span className="block">{error}</span>
            </div>
          )}

          <Card className="w-full border-none shadow-lg dark:shadow-neutral-900 bg-background dark:bg-neutral-800/50 transition-all duration-500">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Parte 1: Configura tu club */}
                {currentStep === 0 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <Store className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold">Configura tu club Inicial</h2>
                    </div>
                    
                    <div className="space-y-5">
                      {renderTooltip("Cómo aparecerá tu club en el sistema y ante tus clientes", 
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary/80" />
                          <Label className="text-base font-medium">Identidad del Club</Label>
                        </div>
                      )}
                      
                      <div className="grid gap-4 md:grid-cols-1 ml-7">
                        <div className="space-y-2">
                          <Label>Nombre comercial</Label>
                          <Input
                            placeholder="Ej: 'NutriVida Express'"
                            value={step1Data.clubNombre}
                            onChange={(e) => setStep1Data({ ...step1Data, clubNombre: e.target.value })}
                            className="dark:border-neutral-600 dark:focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {renderTooltip("Nos ayuda a mostrarte análisis geográficos de tus clientes", 
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary/80" />
                          <Label className="text-base font-medium">Ubicación</Label>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 ml-7">
                        <Input
                          placeholder="Ej: Calle Principal #456, Col. Centro"
                          value={step1Data.direccion}
                          onChange={(e) => setStep1Data({ ...step1Data, direccion: e.target.value })}
                          className="flex-1 dark:border-neutral-600 dark:focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Opciones del Club */}
                    <div className="p-4 bg-muted/20 rounded-xl dark:bg-neutral-700/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5 text-primary/80" />
                          <div className="space-y-1">
                            <Label className="text-base font-medium dark:text-neutral-200">¿Trabajas con equipo?</Label>
                            <p className="text-sm text-muted-foreground dark:text-neutral-300">
                              Activa esta opción si tienes colaboradores
                            </p>
                          </div>
                        </div>
                        <Switch 
                          checked={step1Data.tienesColaboradores}
                          onCheckedChange={(checked) => setStep1Data({ ...step1Data, tienesColaboradores: checked })}
                          className="data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-neutral-600"
                        />
                      </div>
                    </div>
                    
                    {/* Información de Suscripción y Club Adicional */}
                    <div className="space-y-4 border-t border-muted pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="h-5 w-5 text-primary/80" />
                          <Label className="text-base font-medium">¿Tienes otro club?</Label>
                        </div>
                        
                        {permitirAgregarOtroClub ? (
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={agregarOtroClub}
                              onCheckedChange={(checked) => setAgregarOtroClub(checked)}
                              className="data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-neutral-600"
                            />
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-800/20 dark:text-green-300">
                                {(subscription?.clubsMax ?? 0) - 1} extra club disponible
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Tu suscripción no permite más clubes</span>
                          </div>
                        )}
                      </div>
                      
                      {agregarOtroClub && permitirAgregarOtroClub && (
                        <div className="mt-4 space-y-4 border p-4 rounded-lg bg-primary/5 dark:bg-primary/10">
                          <div className="space-y-3">
                            <Label className="text-base font-medium flex items-center gap-2">
                              <Store className="h-4 w-4" />
                              Club adicional
                            </Label>
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Nombre del club adicional</Label>
                                <Input
                                  placeholder="Ej: 'Club Secundario'"
                                  value={additionalClub.clubNombre}
                                  onChange={(e) => setAdditionalClub({ ...additionalClub, clubNombre: e.target.value })}
                                  className="dark:bg-neutral-700/50"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Dirección</Label>
                                <Input
                                  placeholder="Ej: Calle Secundaria #123"
                                  value={additionalClub.direccion}
                                  onChange={(e) => setAdditionalClub({ ...additionalClub, direccion: e.target.value })}
                                  className="dark:bg-neutral-700/50"
                                />
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-primary/10 dark:border-primary/20">
                              <Label className="text-base font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Club principal
                              </Label>
                              
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                <div 
                                  className={`p-3 border rounded-lg flex items-center justify-center cursor-pointer transition-all
                                  ${clubPrincipalSeleccionado === "principal" 
                                    ? "border-primary bg-primary/10 text-primary font-medium" 
                                    : "border-muted hover:border-primary/30"}`}
                                  onClick={() => setClubPrincipalSeleccionado("principal")}
                                >
                                  Club inicial
                                </div>
                                <div 
                                  className={`p-3 border rounded-lg flex items-center justify-center cursor-pointer transition-all
                                  ${clubPrincipalSeleccionado === "adicional" 
                                    ? "border-primary bg-primary/10 text-primary font-medium" 
                                    : "border-muted hover:border-primary/30"}`}
                                  onClick={() => setClubPrincipalSeleccionado("adicional")}
                                >
                                  Club adicional
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parte 2: Configura tu perfil */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <User className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold">Configura tu perfil</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary/80" />
                        <Label className="text-base font-medium">Foto de perfil</Label>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-7">
                        <label className="cursor-pointer flex flex-col items-center justify-center border border-dashed p-4 rounded-lg w-32 h-32 dark:border-neutral-600 hover:border-primary/70 transition-colors">
                          {profilePreview ? (
                            <img src={profilePreview} alt="Preview" className="object-cover w-full h-full rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <User className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm text-muted-foreground">Subir foto</span>
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="hidden"
                          />
                        </label>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>Imagen de perfil que se mostrará en tu cuenta</p>
                          <p>Tamaño recomendado: 200x200 px</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary/80" />
                        <Label className="text-base font-medium">¿Cómo deseas que te llamemos?</Label>
                      </div>
                      
                      <Input
                        placeholder="Ej: 'Carlos'"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="dark:border-neutral-600 dark:focus:border-primary ml-7"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary/80" />
                        <Label className="text-base font-medium">Moneda principal</Label>
                      </div>
                      
                      <Select
                        value={step2Data.moneda}
                        onValueChange={(value) => setStep2Data({ ...step2Data, moneda: value })}
                      >
                        <SelectTrigger className="dark:border-neutral-600 dark:focus:border-primary ml-7">
                          <SelectValue placeholder="Selecciona moneda" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-neutral-800">
                          <SelectItem value="MXN" className="dark:hover:bg-neutral-700">
                            Peso Mexicano (MXN)
                          </SelectItem>
                          <SelectItem value="USD" className="dark:hover:bg-neutral-700">
                            Dólar Estadounidense (USD)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-primary/80" />
                        <Label className="text-base font-medium">Preferencias visuales</Label>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3 ml-7">
                        {[
                          { value: "claro", label: "Claro", icon: <Sun className="h-6 w-6" /> },
                          { value: "oscuro", label: "Oscuro", icon: <Moon className="h-6 w-6" /> },
                          { value: "sistema", label: "Automático", icon: <Monitor className="h-6 w-6" /> },
                        ].map((theme) => (
                          <div
                            key={theme.value}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              step2Data.tema === theme.value
                                ? "border-primary bg-primary/10 dark:bg-primary/20"
                                : "border-muted hover:border-primary/30 dark:border-neutral-600 dark:hover:border-primary/40"
                            }`}
                            onClick={() => setStep2Data({ ...step2Data, tema: theme.value })}
                          >
                            <div className="mb-2">{theme.icon}</div>
                            <span className="font-medium dark:text-neutral-200">{theme.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Parte 3: Meta y alertas */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b pb-3">
                      <Settings className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-semibold">Meta y alertas</h2>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-1">
                      <div className="space-y-4 p-4 rounded-lg border border-muted dark:border-neutral-700 bg-muted/5 dark:bg-neutral-800/30">
                        <div className="flex items-center gap-2 text-primary">
                          <BadgeDollarSign className="h-5 w-5" />
                          <Label className="text-lg font-medium dark:text-neutral-200">Meta de ventas mensuales para tus clubs</Label>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-7">
                          <span className="text-muted-foreground font-medium text-lg">$</span>
                          <Input
                            type="number"
                            placeholder="35000"
                            value={step3Data.metaVentasMensual || ""}
                            onChange={(e) => setStep3Data({ ...step3Data, metaVentasMensual: Number(e.target.value) })}
                            className="flex-1 dark:border-neutral-600 dark:focus:border-primary text-lg"
                          />
                        </div>
                        
                        <p className="text-sm text-muted-foreground dark:text-neutral-400 ml-7">
                          Establece una meta alcanzable para tu negocio.
                        </p>
                      </div>
                      
                      <div className="space-y-4 p-4 rounded-lg border border-muted dark:border-neutral-700 bg-muted/5 dark:bg-neutral-800/30">
                        <div className="flex items-center gap-2 text-primary">
                          <CalendarDays className="h-5 w-5" />
                          <Label className="text-lg font-medium dark:text-neutral-200">Alertas de stock</Label>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-7">
                          <Input
                            type="number"
                            placeholder="7"
                            value={step3Data.diasInventario || ""}
                            onChange={(e) => setStep3Data({ ...step3Data, diasInventario: Number(e.target.value) })}
                            className="flex-1 dark:border-neutral-600 dark:focus:border-primary text-lg"
                          />
                          <span className="text-muted-foreground font-medium text-lg">unidades</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground dark:text-neutral-400 ml-7">
                          Establece un límite para recibir alertas cuando tus productos lleguen a este stock.
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-primary/5 rounded-xl dark:bg-neutral-700/20">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-primary mt-1" />
                        <p className="text-sm text-muted-foreground dark:text-neutral-300">
                          💡 Todos estos ajustes podrás modificarlos más tarde desde la sección de Configuración en tu panel de control.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="flex justify-between pt-6 border-t border-muted">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  {currentStep < 2 ? (
                    // Botón de Continuar para pasos 0 y 1
                    <Button type="button" onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
                      Continuar
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    // Botón de Completar para paso 2
                    <Button type="submit" disabled={isLoading} className="gap-2 bg-green-600 hover:bg-green-700">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Completar configuración
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}