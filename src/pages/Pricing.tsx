import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Básico",
    price: "299",
    currency: "MXN",
    description: "Ideal para pequeños clubes que empiezan operaciones",
    features: [
      "Gestión completa de ventas",
      "Control de inventario",
      "Gestión financiera",
      "Dashboard centralizado",
      "Metas mensuales",
      "1 Club/Sucursal",
      "2 usuarios",
      "Soporte 24/7 vía chat y correo"
    ],
    highlighted: false
  },
  {
    name: "Intermedio",
    price: "499",
    currency: "MXN",
    description: "Ideal para quienes manejan dos sedes o quieren crecer",
    features: [
      "Todo lo de Básico",
      "2 Clubes/Sucursales",
      "4 usuarios con acceso individual",
      "Reportes personalizados",
      "Dashboard por sucursal",
      "Gestión de roles",
      "Soporte prioritario",
      "Capacitación personalizada"
    ],
    highlighted: true
  },
  {
    name: "Premium",
    price: "749",
    currency: "MXN",
    description: "Ideal para operadores medianos con varias sedes",
    features: [
      "Todo lo de Intermedio",
      "3 Clubes/Sucursales",
      "10 usuarios con permisos granulares",
      "Reportes avanzados",
      "Analytics por empleado",
      "Análisis de rentabilidad",
      "API access",
      "Asesoría mensual dedicada"
    ],
    highlighted: false
  },
  {
    name: "Personalizado",
    price: null,
    currency: "MXN",
    description: "Ideal para necesidades específicas y operaciones más grandes",
    features: [
      "Todo lo de Premium",
      "Clubes ilimitados",
      "Usuarios ilimitados",
      "Características a medida",
      "Implementación guiada",
      "Consultor dedicado",
      "SLA garantizado",
      "Integraciones personalizadas"
    ],
    highlighted: false
  }
];

export function PricingPage() {
  return (
    <div className="py-24 px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
          Precios simples y transparentes
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Elije el plan que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${
            plan.highlighted 
              ? 'border-primary shadow-lg scale-105' 
              : 'border-border hover:border-primary/50 transition-all duration-300'}`
          }>
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                {plan.price ? (
                  <>
                    <span className="text-sm font-medium text-muted-foreground">{plan.currency}</span>
                    <span className="text-4xl font-bold ml-1">${plan.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold">Contactar</span>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="mt-8 w-full" 
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.price ? 'Comenzar prueba' : 'Contactar ventas'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
