import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  Sun,
  Moon,
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Plus,
  Briefcase,
  Box,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalesChart } from "./charts/SalesChart";
import MonthlyGoalCard from "./CircularProgress";
import { RecentSales } from "./RecentSales";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "@/services/api";
import { toast } from "sonner";
import { useClub } from "@/context/ClubContext";

interface TokenPayload {
  userId: string;
  nombre: string;
  displayName: string;
  role: string;
  clubPrincipal: string;
}


const getUserName = (): string => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.displayName || decoded.nombre || "Usuario";
    } catch (error) {
      console.error("Error decodificando el token", error);
      return "Usuario";
    }
  }
  return "Usuario";
};

const quickActions = [
  { icon: ShoppingCart, label: "Nueva Venta", color: "bg-blue-500", path: "/sales" },
  { icon: Briefcase, label: "Registrar Gasto", color: "bg-purple-500", path: "/expenses" },
  { icon: Box, label: "Ver Inventario", color: "bg-green-500", path: "/inventory" },
  { icon: FileText, label: "Generar Reporte", color: "bg-yellow-500", path: "/reports" },
  { icon: Plus, label: "Agregar Producto", color: "bg-pink-500", path: "/products" },
  { icon: Users, label: "Gestión de Empleados", color: "bg-indigo-500", path: "/employees" },
];

export default function Dashboard() {
  const [greeting, setGreeting] = useState("");
  const [notifications] = useState([
    {
      id: 1,
      title: "Stock bajo en Proteína X",
      description: "Quedan 5 porciones",
      time: "Hace 10 minutos",
      unread: true,
    },
    {
      id: 2,
      title: "Meta mensual cerca",
      description: "Has alcanzado el 75% de tu meta",
      time: "Hace 1 hora",
      unread: true,
    },
  ]);
  const [kpis, setKpis] = useState({
    salesTotal: 0,
    expensesTotal: 0,
    netProfit: 0,
    salesGrowth: 0,
    netProfitGrowth: 0,
    inventoryCritical: 0,
    inventoryItems: [] as { name: string; stock: string }[],
  });
  const [monthlyGoal, setMonthlyGoal] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalRemaining, setGoalRemaining] = useState(0);
  const [goalProjection, setGoalProjection] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "annual">("weekly");
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const navigate = useNavigate();

  const userName = getUserName();
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting(`☀️ Buenos días, ${userName}`);
    } else if (hour >= 12 && hour < 19) {
      setGreeting(`🌤️ Buenas tardes, ${userName}`);
    } else {
      setGreeting(`🌙 Buenas noches, ${userName}`);
    }
  }, [userName]);
  
  const { activeClub, clubs, clubNames, setActiveClub } = useClub();


  const handleClubChange = (clubId: string) => {
    setActiveClub(clubId);
  };


  // Obtener datos del club (incluye metaMensual)
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const res = await api.get(`/clubs/${activeClub}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        // Establecer meta mensual si existe
        setMonthlyGoal(res.data.metaMensual || 0);
      } catch (error) {
        console.error("Error fetching club data:", error);
        toast.error("Error al obtener datos del club");
      }
    };
    if (activeClub) {
      fetchClubData();
    }
  }, [activeClub]);

  // Obtener KPIs del dashboard
  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await api.get(`/dashboard/kpis`, {
          params: { clubId: activeClub },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setKpis(res.data);
      } catch (error) {
        console.error("Error fetching dashboard KPIs:", error);
        toast.error("Error al obtener los KPIs del dashboard");
      }
    };
    if (activeClub) {
      fetchKPIs();
    }
  }, [activeClub]);

  // Calcular progreso de meta, monto restante y proyección en días
  useEffect(() => {
    if (monthlyGoal > 0) {
      const currentSales = kpis.salesTotal;
      const progress = Math.min(Math.round((currentSales / monthlyGoal) * 100), 100);
      setGoalProgress(progress);
      const remaining = monthlyGoal - currentSales;
      setGoalRemaining(remaining > 0 ? remaining : 0);
      // Promedio diario: suponiendo que ya pasó el día actual en el mes
      const today = new Date();
      const dayOfMonth = today.getDate();
      const averageDailySales = currentSales / dayOfMonth;
      const daysToGoal = averageDailySales > 0 ? Math.ceil(remaining / averageDailySales) : 0;
      setGoalProjection(daysToGoal);
    }
  }, [monthlyGoal, kpis.salesTotal]);

  // Función para actualizar la meta mensual
  const handleSaveGoal = async () => {
    try {
      const goalNumber = Number(newGoal);
      if (isNaN(goalNumber) || goalNumber <= 0) {
        toast.error("Ingrese un valor válido para la meta");
        return;
      }
      const res = await api.put(
        `/clubs/${activeClub}/goal`,
        { metaMensual: goalNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMonthlyGoal(res.data.metaMensual);
      toast.success("Meta actualizada correctamente");
      setEditGoalOpen(false);
    } catch (error) {
      console.error("Error updating monthly goal:", error);
      toast.error("Error al actualizar la meta mensual");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      {editGoalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Editar Meta Mensual</h3>
            <input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Ingrese nueva meta"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditGoalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveGoal}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{greeting}</h2>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Administrando:</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-primary hover:text-primary/80">
                  <Star className="h-4 w-4" />
                  <span>
                    {activeClub ? clubNames[activeClub] || "Seleccionar Club" : "Cargando..."}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Cambiar de Club</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {clubs.length > 0 ? (
                    clubs.map((club) => (
                      <DropdownMenuItem
                        key={club}
                        className={`flex items-center gap-2 cursor-pointer ${
                          club === activeClub ? "bg-muted" : ""
                        }`}
                        onClick={() => handleClubChange(club)}
                      >
                        <Star className="h-4 w-4" />
                        <span>{clubNames[club] || club}</span>
                        {club === activeClub && (
                          <span className="ml-auto text-green-500 text-xs">Activo</span>
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>No hay clubes disponibles</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
  
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notifications.some((n) => n.unread) && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      <span className="font-medium">{notification.title}</span>
                      {notification.unread && (
                        <Badge variant="secondary" className="ml-auto">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2">
                      {notification.time}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
  
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Tema Claro</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Tema Oscuro</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
  
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="p-4 hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => navigate(action.path)}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-3 rounded-xl ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                  <action.icon className={`h-6 w-6 ${action.color.replace("bg-", "text-")}`} />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
            </Card>
          ))}
        </div>
  
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Ventas del Mes */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Ventas del Mes</h3>
                <div className="flex items-center text-green-500">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm">+{kpis.salesGrowth}%</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">${kpis.salesTotal.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Ventas totales en el mes</p>
              </div>
            </div>
          </Card>
  
          {/* Ganancias Netas */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Ganancias Netas</h3>
                <div className="flex items-center text-red-500">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  <span className="text-sm">-{kpis.netProfitGrowth}%</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">${kpis.netProfit.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Ventas - Gastos</p>
              </div>
            </div>
          </Card>
  
          {/* Gastos Totales */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Gastos Totales</h3>
                <DollarSign className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">${kpis.expensesTotal.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">Gastos en el mes</p>
              </div>
            </div>
          </Card>
  
          {/* Inventario Crítico */}
          <Card
            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50 cursor-pointer"
            onClick={() => navigate("/inventory")}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Inventario Crítico</h3>
                <Package className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{kpis.inventoryCritical} productos</div>
                {kpis.inventoryItems.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {kpis.inventoryItems.slice(0, 3).map((item, index) => (
                      <li key={index}>• {item.name}: {item.stock}</li>
                    ))}
                    {kpis.inventoryItems.length > 3 && (
                      <li>y {kpis.inventoryItems.length - 3} más con bajo stock...</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        </div>
  
        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Sales vs Expenses Chart con selector de período integrado */}
          <Card className="p-6 lg:col-span-4 bg-gradient-to-br from-background to-muted/10">
            <div className="flex items-center justify-between mb-2">
              <div className="space-y-1">
                <h3 className="font-medium">Ventas vs Gastos</h3>
                <p className="text-sm text-muted-foreground">Comparativa del mes actual</p>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-muted-foreground mr-2">Periodo:</span>
                <select
                  value={selectedPeriod}
                  onChange={(e) =>
                    setSelectedPeriod(e.target.value as "weekly" | "monthly" | "annual")
                  }
                  className="rounded border p-1 text-sm"
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            </div>
            <div className="h-[300px] mt-4">
              <SalesChart period={selectedPeriod} clubId={activeClub} />
            </div>
          </Card>
  
          {/* Monthly Goal Card */}
          <Card className="p-6 lg:col-span-3 bg-gradient-to-br from-primary/5 to-purple-100/5">
          <MonthlyGoalCard 
            kpis={kpis}
            monthlyGoal={monthlyGoal}
            goalProgress={goalProgress}
            goalRemaining={goalRemaining}
            goalProjection={goalProjection}
            setNewGoal={setNewGoal}
            setEditGoalOpen={setEditGoalOpen}
          />
          </Card>
        </div>
  
        {/* Recent Sales */}
        <Card className="bg-gradient-to-br from-background to-muted/10">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Últimas Ventas</h3>
                <p className="text-sm text-muted-foreground">Ventas más recientes del día</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/sales")}>
                Ver todas las ventas
              </Button>
            </div>
          </div>
          <RecentSales />
        </Card>
      </div>
  
      {/* Modal para editar la meta mensual */}
      {editGoalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Editar Meta Mensual</h3>
            <input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Ingrese nueva meta"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditGoalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveGoal}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



