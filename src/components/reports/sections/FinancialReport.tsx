import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ... imports existentes ...

// Agregar esta interfaz
interface TrendData {
  name: string;
  sales: number;
  expenses: number;
  profit: number;
}

interface FinancialData {
  totalSales: number;
  previousPeriodSales: number;
  operatingExpenses: number;
  previousPeriodExpenses: number;
  netProfit: number;
  previousPeriodProfit: number;
  monthlyTrend: {
    date: string;
    year: number;
    month: number;
    sales: number;
    expenses: number;
    profit: number;
  }[];
  breakdown: {
    category: string;
    amount: number;
    previousAmount: number;
  }[];
  dateRange: {
    start: string;
    end: string;
    period: string;
  };
}

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

export function FinancialReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinancialData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const params: any = {
          period: selectedPeriod,
          startDate: dateRange.start,
          endDate: dateRange.end,
        };
        if (selectedClub !== "all") params.clubId = selectedClub;

        const response = await api.get<FinancialData>("/reports/financial", { params });
        setData(response.data);
        setError(null);
        // Reset pagination when new data is loaded
        setCurrentPage(1);
      } catch (err: any) {
        console.error("Error fetching financial data:", err);
        setError(err.response?.data?.message || "Error al cargar los datos financieros");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [selectedClub, selectedPeriod, dateRange]);

  // Agregar este useEffect para la tendencia
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const res = await api.get("/reports/sales-trend", {
          params: { clubId: selectedClub, period: selectedPeriod },
        });
        setTrendData(normalizeDate(res.data));
      } catch (error) {
        console.error("Error fetching trend data:", error);
      }
    };

    fetchTrendData();
  }, [selectedClub, selectedPeriod]);

  // Función para normalizar fechas
  const normalizeDate = (data: TrendData[]) => {
    return data.map((item) => {
      // No procesar si ya es un formato específico (como "Semana X" o nombres de meses)
      if (
        item.name.startsWith("Semana") ||
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].includes(item.name) ||
        ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
         "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].includes(item.name)
      ) {
        return item;
      }
  
      return {
        ...item,
        name: new Date(item.name).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
      };
    });
  };

  const getTrendTitle = () => {
    switch (selectedPeriod) {
      case "week":
        return "Tendencia Semanal";
      case "month":
        return "Tendencia Mensual";
      case "year":
        return "Tendencia Anual";
      case "custom":
        return "Tendencia Personalizada";
      default:
        return "Tendencia";
    }
  };

  const formatChartDate = (dateStr: string) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    switch (selectedPeriod) {
      case "week":
        return date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
      case "month":
        return date.toLocaleDateString("es-ES", { day: "numeric" });
      case "year":
        return date.toLocaleDateString("es-ES", { month: "short" });
      case "custom":
        const daysDiff = Math.ceil(
          (new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysDiff <= 31) {
          return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
        } else if (daysDiff <= 365) {
          return date.toLocaleDateString("es-ES", { month: "short" });
        } else {
          return date.toLocaleDateString("es-ES", { month: "short", year: "numeric" });
        }
      default:
        return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBreakdown = data?.breakdown
    ? [...data.breakdown].sort((a, b) => {
        if (!sortConfig) return 0;
        const aValue = a[sortConfig.key as keyof typeof a];
        const bValue = b[sortConfig.key as keyof typeof b];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      })
    : [];

  // Pagination logic
  const totalPages = Math.ceil((sortedBreakdown?.length || 0) / itemsPerPage);
  const paginatedBreakdown = sortedBreakdown.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Función para preparar datos de tendencia optimizados (eliminada la lógica anterior del gráfico)
  // Reemplazar la sección del gráfico con la nueva función:
  const renderTrendChart = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{getTrendTitle()}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Evolución de ventas, gastos y ganancias</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Fecha
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload.name}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Ventas
                          </span>
                          <span className="font-bold text-green-500">
                            ${Number(payload[0].value).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Gastos
                          </span>
                          <span className="font-bold text-red-500">
                            ${Number(payload[1].value).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Ganancias
                          </span>
                          <span className="font-bold text-blue-500">
                            ${Number(payload[2].value).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line
              name="Ventas"
              type="monotone"
              dataKey="sales"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
            />
            <Line
              name="Gastos"
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              name="Ganancias"
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }
  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Mostrar el rango de fechas visible */}
      {data?.dateRange && (
        <div className="text-sm text-muted-foreground">
          Mostrando datos del {formatDate(data.dateRange.start)} al {formatDate(data.dateRange.end)}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Sales */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Ventas Totales</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de ventas incluyendo productos sellados y preparaciones</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">${data.totalSales.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(data.totalSales, data.previousPeriodSales) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{calculatePercentageChange(data.totalSales, data.previousPeriodSales).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      {calculatePercentageChange(data.totalSales, data.previousPeriodSales).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">vs período anterior</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Operating Expenses */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Gastos Operativos</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total de gastos incluyendo compras, servicios y renta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                ${data.operatingExpenses.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(data.operatingExpenses, data.previousPeriodExpenses) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      +{calculatePercentageChange(data.operatingExpenses, data.previousPeriodExpenses).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {calculatePercentageChange(data.operatingExpenses, data.previousPeriodExpenses).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">vs período anterior</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Net Profit */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">Ganancias Netas</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ganancias después de restar todos los gastos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                ${data.netProfit.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(data.netProfit, data.previousPeriodProfit) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{calculatePercentageChange(data.netProfit, data.previousPeriodProfit).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      {calculatePercentageChange(data.netProfit, data.previousPeriodProfit).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">vs período anterior</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reemplazar el Chart existente con el nuevo */}
      {renderTrendChart()}

      {/* Breakdown Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Desglose por Categoría</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Detalle de ingresos y gastos por categoría</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {paginatedBreakdown.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("category")} className="hover:bg-transparent">
                      Categoría
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("amount")} className="hover:bg-transparent">
                      Monto Actual
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("previousAmount")} className="hover:bg-transparent">
                      Período Anterior
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Variación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedBreakdown.map((item) => {
                  const percentageChange = calculatePercentageChange(item.amount, item.previousAmount);
                  const isPositive = item.amount >= 0;
                  const changeIsPositive = percentageChange > 0;

                  return (
                    <TableRow key={item.category}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className={isPositive ? "text-green-600" : "text-red-600"}>
                        {isPositive ? "+" : ""}
                        {item.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className={item.previousAmount >= 0 ? "text-green-600" : "text-red-600"}>
                        {item.previousAmount >= 0 ? "+" : ""}
                        {item.previousAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {changeIsPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                          <span className={changeIsPositive ? "text-green-500" : "text-red-500"}>
                            {changeIsPositive ? "+" : ""}
                            {percentageChange.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
                {Math.min(currentPage * itemsPerPage, sortedBreakdown.length)} de {sortedBreakdown.length} categorías
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No hay datos de categorías disponibles
          </div>
        )}
      </Card>
    </div>
  );
}
