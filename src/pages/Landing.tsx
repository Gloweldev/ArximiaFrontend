import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useInView } from "@/hooks/useInView";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  BarChart3,
  Package,
  DollarSign,
  Users,
  Star,
  Option,
  Clock,
  ArrowRight,
  CheckCircle2,
  Shield,
  Building,
  HeartHandshake,
  Sparkles,
  CloudCog,
  Settings,
  Cloud,
  HeadphonesIcon,
  Monitor,
  Tablet,
  Smartphone,
  MoonIcon,
  SunIcon,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function LandingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Package,
      title: "Módulo de Ventas",
      description: "Registra ventas cerradas o preparadas en segundos con interfaz intuitiva."
    },
    {
      icon: BarChart3,
      title: "Dashboard Interactivo",
      description: "Visualiza todas tus métricas clave y toma decisiones informadas."
    },
    {
      icon: Clock,
      title: "Historial y Filtros",
      description: "Accede y filtra todo tu histórico de transacciones fácilmente."
    },
    {
      icon: Settings,
      title: "Inventario Inteligente",
      description: "Control automático de stock con alertas y reportes detallados."
    },
    {
      icon: Users,
      title: "Gestión de Usuarios",
      description: "Maneja permisos y roles para todo tu equipo de trabajo."
    },
    {
      icon: DollarSign,
      title: "Reportes Financieros",
      description: "Exporta reportes detallados en PDF y Excel cuando lo necesites."
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: "Ahorro de Tiempo",
      description: "Automatiza cálculos y reduce el papeleo en tu operación diaria."
    },
    {
      icon: Building,
      title: "Control Total",
      description: "Monitorea tu negocio desde cualquier dispositivo, en tiempo real."
    },
    {
      icon: HeartHandshake,
      title: "Decisiones Informadas",
      description: "Datos claros para optimizar precios, descuentos y metas."
    }
  ];

  const whyUs = [
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Tus datos siempre seguros y respaldados en la nube."
    },
    {
      icon: Star,
      title: "Soporte Premium",
      description: "Asistencia personalizada y guías paso a paso."
    },
    {
      icon: CloudCog,
      title: "Actualizaciones Constantes",
      description: "Mejoras continuas y nuevas funcionalidades incluidas."
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: billingInterval === 'monthly' ? 299 : 2990,
      description: "Ideal para pequeños clubes que empiezan operaciones",
      features: [
        "1 Club/Sucursal",
        "2 usuarios",
        "Gestión completa de ventas",
        "Control total de inventario",
        "Dashboard centralizado",
        "Reportes y métricas",
        "Soporte 24/7",
        "Respaldos automáticos"
      ],
      highlighted: false
    },
    {
      name: "Intermedio",
      price: billingInterval === 'monthly' ? 499 : 4990,
      description: "Ideal para quienes manejan dos sedes",
      features: [
        "2 Clubes/Sucursales",
        "4 usuarios",
        "Gestión completa de ventas",
        "Control total de inventario",
        "Dashboard centralizado",
        "Reportes y métricas",
        "Soporte 24/7",
        "Respaldos automáticos"
      ],
      highlighted: true
    },
    {
      name: "Premium",
      price: billingInterval === 'monthly' ? 749 : 7490,
      description: "Para operadores con varias sedes",
      features: [
        "3 Clubes/Sucursales",
        "10 usuarios",
        "Gestión completa de ventas",
        "Control total de inventario",
        "Dashboard centralizado",
        "Reportes y métricas",
        "Soporte 24/7",
        "Respaldos automáticos"
      ],
      highlighted: false
    },
    {
      name: "Personalizado",
      price: null,
      currency: "MXN",
      description: "¿Necesitas más clubes o usuarios?",
      features: [
        "Clubes ilimitados",
        "Usuarios ilimitados",
        "Gestión completa de ventas",
        "Control total de inventario",
        "Dashboard centralizado",
        "Reportes y métricas",
        "Soporte 24/7",
        "Respaldos automáticos"
      ],
      highlighted: false
    }
  ];

  const devices = [
    {
      type: "desktop",
      image: "/dashboard-desktop.png",
      title: "Desktop"
    },
    {
      type: "tablet",
      image: "/dashboard-tablet.png",
      title: "Tablet"
    },
    {
      type: "mobile",
      image: "/dashboard-mobile.png",
      title: "Mobile"
    }
  ];

  const faqs = [
    {
      question: "¿Necesito descargar algo para usar Arximia?",
      answer: "No, Arximia es 100% basada en web. Solo necesitas un navegador moderno."
    },
    {
      question: "¿Qué pasa después de los 3 días de prueba?",
      answer: "Puedes elegir el plan que mejor se adapte a tu negocio o cancelar sin compromiso."
    },
    {
      question: "¿Puedo exportar mis datos?",
      answer: "Sí, exporta a Excel o PDF en cualquier momento, tus datos son tuyos."
    },
    {
      question: "¿Ofrecen capacitación?",
      answer: "Sí, incluimos guías paso a paso y soporte personalizado en todos los planes."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Navbar - Add theme toggle */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'h-16 bg-white/90 backdrop-blur-md shadow-sm' 
          : 'h-20 bg-white/80'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center">
              <Option className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Arximia</span>
            <span className="text-sm text-muted-foreground hidden sm:inline">by Glowel</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary">Características</a>
            <a href="#how-it-works" className="text-sm hover:text-primary">Cómo Funciona</a>
            <Link to="/pricing" className="text-sm hover:text-primary">Precios</Link>
            <a href="#support" className="text-sm hover:text-primary">Soporte</a>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2"
            >
              {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex">
                Iniciar Sesión
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700">
                Prueba Gratis 3 Días
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-brand-50 via-purple-50/50 to-background">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Control total de tu negocio en un solo lugar
              </h1>
              <p className="text-xl text-muted-foreground">
                Gestiona ventas, inventario y finanzas de tu club de nutrición o tienda 
                de forma rápida y sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700">
                    Empieza tu prueba gratis <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Ver características
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 opacity-30 blur"></div>
                <div className="relative rounded-xl bg-white/80 backdrop-blur-sm shadow-2xl p-4">
                  <img 
                    src="/Captura de pantalla 2025-05-07 120525.png" 
                    alt="Dashboard Arximia" 
                    className="rounded-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Arximia Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">¿Qué es Arximia?</h2>
          <p className="text-lg text-muted-foreground">
            Arximia es la plataforma web de Glowel diseñada para optimizar la administración 
            operativa y financiera de pequeños negocios. Nuestra misión es ahorrarte tiempo, 
            reducir errores y darte una vista panorámica de tu operación diaria.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-br from-background via-purple-50/50 to-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Cómo Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Regístrate",
                description: "Crea tu cuenta en 30 segundos y obtén 3 días gratis."
              },
              {
                step: "02",
                title: "Configura",
                description: "Sube tu catálogo y personaliza tus productos."
              },
              {
                step: "03",
                title: "Vende",
                description: "Registra ventas con descuentos y costos automatizados."
              },
              {
                step: "04",
                title: "Analiza",
                description: "Visualiza en tiempo real ventas, ganancias y metas."
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="text-7xl font-bold text-primary/10 absolute -top-10 left-0">
                  {step.step}
                </div>
                <div className="relative bg-white dark:bg-neutral-900 p-6 rounded-xl border shadow-lg">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section - New */}
      <section className="py-16 px-4 bg-gradient-to-br from-background via-brand-50/30 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6 p-6 rounded-xl bg-red-50 dark:bg-red-900/10">
              <h3 className="text-2xl font-display font-bold text-red-600 dark:text-red-400">
                El Problema
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                  <span>Lidiar con inventarios dispersos, cálculos manuales y mala administración te hace perder tiempo y dinero.</span>
                </li>
                {/* ...more pain points... */}
              </ul>
            </div>
            <div className="space-y-6 p-6 rounded-xl bg-green-50 dark:bg-green-900/10">
              <h3 className="text-2xl font-display font-bold text-green-600 dark:text-green-400">
                La Solución
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                  <span>Arximia agrupa todo en un solo panel, automatiza cálculos y te simplifica tu negocio.</span>
                </li>
                {/* ...more solutions... */}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Device Preview Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Accede desde cualquier dispositivo
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Monitor,
                title: "Desktop",
                desc: "Gestiona todo desde tu PC o Mac"
              },
              {
                icon: Tablet,
                title: "Tablet",
                desc: "Perfecta para punto de venta"
              },
              {
                icon: Smartphone,
                title: "Mobile",
                desc: "Consultas rápidas en ruta"
              }
            ].map((device) => (
              <div key={device.title} className="text-center group">
                <div className="mb-6 transform transition-all duration-300 group-hover:scale-110">
                  <device.icon className="h-16 w-16 mx-auto text-brand-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{device.title}</h3>
                <p className="text-muted-foreground">{device.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground">
            Sin descargas, sin instalaciones: abre arximia.com desde tu navegador, estés donde estés.
          </p>
        </div>
      </section>

      {/* Updated Features Section with animations */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const [ref, isInView] = useInView({ triggerOnce: true });
              
              return (
                <div
                  ref={ref}
                  key={index}
                  className={`group relative bg-white dark:bg-neutral-900 p-6 rounded-xl border shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    transitionProperty: 'all'
                  }}
                >
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity blur"></div>
                  <div className="relative">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-purple-50/50 to-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Beneficios Clave</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {whyUs.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 sm:py-32 lg:px-8 bg-gradient-to-br from-background via-brand-50/30 to-background">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-display font-bold tracking-tight text-brand-600 sm:text-6xl">
            Precios simples y transparentes
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Todos los planes incluyen acceso completo a todas las funcionalidades
          </p>
          
          {/* Toggle Anual/Mensual */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm ${billingInterval === 'monthly' ? 'text-brand-600' : 'text-muted-foreground'}`}>
              Mensual
            </span>
            <Switch
              checked={billingInterval === 'yearly'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'yearly' : 'monthly')}
            />
            <span className={`text-sm ${billingInterval === 'yearly' ? 'text-brand-600' : 'text-muted-foreground'}`}>
              Anual
              <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-1 text-xs font-medium text-brand-600">
                -15%
              </span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col p-6 ${
                plan.highlighted 
                  ? 'border-brand-500 shadow-lg scale-105' 
                  : 'border-border hover:border-brand-200'
              }`}
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground mt-2">{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">MXN/{billingInterval === 'monthly' ? 'mes' : 'año'}</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold">Contactar</span>
                )}
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-brand-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className={`mt-8 ${
                plan.highlighted 
                  ? 'bg-brand-500 hover:bg-brand-600 text-white' 
                  : 'bg-brand-50 hover:bg-brand-100 text-brand-700'
              }`}>
                {plan.price ? 'Comenzar prueba' : 'Contactar'}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section - New */}
      <section className="py-24 px-4 bg-gradient-to-br from-background via-brand-50/30 to-background">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-display font-bold text-center mb-16">
            Preguntas Frecuentes
          </h2>
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Transforma la gestión de tu negocio hoy
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Prueba Arximia gratis por 3 días y descubre por qué cientos de negocios confían en nosotros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Empieza tu prueba gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
        <Button 
          size="lg"
          className="bg-brand-500 hover:bg-brand-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Prueba gratis 3 días <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Arximia" className="h-8 w-8" />
                <span className="font-bold">Arximia</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Desarrollado en México por Glowel, con foco en negocios locales.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary">Características</a></li>
                <li><a href="#pricing" className="hover:text-primary">Precios</a></li>
                <li><a href="#" className="hover:text-primary">Guías</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Compañía</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contacto</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Términos</a></li>
                <li><a href="#" className="hover:text-primary">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Arximia by Glowel. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
