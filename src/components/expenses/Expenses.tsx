import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Download,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  File as FilePdf,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Building2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ExpensesList } from "./ExpensesList";
import { NewExpenseModal } from "./modals/NewExpense";
import { ExpenseChart } from "./ExpenseChart";
import api from "@/services/api";
import { useClub } from "@/context/ClubContext";
import { useToast } from "@/hooks/use-toast";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Opciones para filtro de categorías (puedes ajustarlas o cargarlas desde el backend)
const mockCategories = [
  { id: "purchases", name: "Compras", icon: ShoppingBag, color: "text-blue-500" },
  { id: "rent", name: "Renta", icon: Building2, color: "text-purple-500" },
  { id: "services", name: "Servicios", icon: Zap, color: "text-yellow-500" },
];

// Función para ajustar el rango de fechas, sumando un día a cada fecha y estableciendo las horas al inicio y fin del día
const convertRangeForQuery = (range: { start: string; end: string }) => {
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  startDate.setDate(startDate.getDate() + 1);
  endDate.setDate(endDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 0);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

export default function Expenses() {
  const { activeClub } = useClub();
  const { toast } = useToast();

  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Por defecto, el rango es el inicio y fin del mes corriente
  const today = new Date();
  
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [dateRange, setDateRange] = useState({
    start: defaultStart,
    end: defaultEnd,
  });
  const [kpiData, setKpiData] = useState({
    totalExpenses: 0,
    previousMonthExpenses: 0,
    averageExpense: 0,
    topCategory: { name: "N/A", percentage: 0 },
  });
  const [chartData, setChartData] = useState<any[]>([]);
  // Estado para forzar la actualización de datos (por ejemplo, luego de registrar un nuevo gasto)
  const [refresh, setRefresh] = useState(0);

  // Función que se invoca cuando se registra un nuevo gasto
  const handleExpenseCreated = () => {
    setRefresh((prev) => prev + 1);
  };

  // Endpoint para KPIs: se pasa el rango de fechas sin conversión (asumimos que el backend interpreta correctamente el ISO)
  useEffect(() => {
    const fetchKpis = async () => {
      if (!activeClub) return;
      try {
        const res = await api.get("/expenses/kpis", {
          params: { 
            clubId: activeClub,
            start: dateRange.start,
            end: dateRange.end,
          },
        });
        setKpiData(res.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los indicadores de gasto",
          variant: "destructive",
        });
      }
    };

    fetchKpis();
  }, [activeClub, toast, refresh, dateRange]);

  // Endpoint para datos del gráfico
  useEffect(() => {
    const fetchChartData = async () => {
      if (!activeClub) return;
      try {
        const res = await api.get("/expenses/chart", {
          params: { 
            clubId: activeClub,
            start: dateRange.start,
            end: dateRange.end,
          },
        });
        setChartData(res.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos del gráfico",
          variant: "destructive",
        });
      }
    };

    fetchChartData();
  }, [activeClub, toast, refresh, dateRange]);

  // Función de exportación que utiliza el rango de fechas ajustado
  const handleExport = async (format: "excel" | "pdf") => {
    try {
      const { start, end } = convertRangeForQuery(dateRange);
      // Obtener los gastos filtrados desde el backend
      const res = await api.get(
        `/expenses?clubId=${activeClub}&start=${start}&end=${end}&search=${searchTerm}&category=${selectedCategory !== "all" ? selectedCategory : ""}`
      );
      const expenses = res.data;

      // Preparar datos para el reporte
      const reportData = expenses.map((expense: any) => ({
        "Fecha": new Date(expense.date).toLocaleDateString("es-MX"),
        "Descripción": expense.description,
        "Categoría": expense.category,
        "Monto": expense.amount,
      }));

      if (format === "pdf") {
        const doc = new jsPDF();
        const title = `Reporte de Gastos - Club ${activeClub}`;
        const subtitle = `Período: ${dateRange.start} - ${dateRange.end} | Exportado: ${new Date().toLocaleDateString("es-MX")}`;
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(12);
        doc.text(subtitle, 14, 28);
        const tableColumn = ["Fecha", "Descripción", "Categoría", "Monto"];
        const tableRows = reportData.map((row: { [x: string]: any; }) => [
          row["Fecha"],
          row["Descripción"],
          row["Categoría"],
          row["Monto"],
        ]);
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          styles: { fontSize: 8 },
        });
        doc.save(`Gastos_${dateRange.start}_a_${dateRange.end}.pdf`);
        toast({
          title: "Éxito",
          description: "Exportado a PDF",
          variant: "default",
        });
      } else if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const dataBlob = new Blob([excelBuffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(dataBlob, `Gastos_${dateRange.start}_a_${dateRange.end}.xlsx`);
        toast({
          title: "Éxito",
          description: "Exportado a Excel",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error exportando gastos:", error);
      toast({
        title: "Error",
        description: "Error al exportar los datos",
        variant: "destructive",
      });
    }
  };

  // Desestructuramos los KPIs
  const { totalExpenses, previousMonthExpenses, averageExpense, topCategory } = kpiData;
  const percentageChange =
    previousMonthExpenses > 0
      ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Gastos
                </h1>
                <p className="text-muted-foreground">
                  Gestiona y monitorea todos los gastos del negocio
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewExpenseModal(true)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Gasto
            </button>
          </div>

          {/* Filtros y Controles */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Rango de Fechas */}
            <div className="col-span-2">
              <div className="bg-card rounded-xl shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Fecha Inicio</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                        className="w-full pl-9 rounded-lg border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Fecha Fin</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                        className="w-full pl-9 rounded-lg border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exportar Datos */}
            <div>
              <div className="bg-card rounded-xl shadow-sm border p-4">
                <label className="text-sm font-medium block mb-2">Exportar Datos</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleExport("excel")}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Exportar a Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      <FilePdf className="h-4 w-4 mr-2" />
                      Exportar a PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Gasto Total del Mes */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Gasto Total del Mes
                </h3>
                {percentageChange > 0 ? (
                  <div className="flex items-center text-red-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm">+{percentageChange.toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-green-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-sm">{percentageChange.toFixed(1)}%</span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ${totalExpenses.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  vs ${previousMonthExpenses.toLocaleString()} mes anterior
                </p>
              </div>
            </div>
          </Card>

          {/* Categoría con Mayor Gasto */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Categoría con Mayor Gasto
              </h3>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {topCategory.name}
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {topCategory.percentage}% del total
                    </span>
                    <span className="font-medium">
                      {topCategory.percentage}%
                    </span>
                  </div>
                  <Progress value={+topCategory.percentage} className="h-2" />
                </div>
              </div>
            </div>
          </Card>

          {/* Gasto Promedio */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Gasto Promedio
              </h3>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${averageExpense.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Promedio por transacción del mes
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Gastos y Gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Gastos */}
          <div>
            <Card className="shadow-xl">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar por descripción o monto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background"
                  />
                </div>
              </div>
              <ExpensesList
                refresh={refresh}
                dateRange={dateRange}
                searchTerm={searchTerm}
                selectedCategory={selectedCategory}
              />
            </Card>
          </div>

          {/* Gráfico de Distribución de Gastos */}
          <div>
            <Card className="p-6">
              <div className="space-y-1">
                <h3 className="font-medium">Distribución por Categoría</h3>
                <p className="text-sm text-muted-foreground">
                  Desglose de gastos del período seleccionado
                </p>
              </div>
              <div className="h-[300px] mt-4">
                <ExpenseChart chartData={chartData} />
              </div>
            </Card>
          </div>
        </div>
      </div>

      <NewExpenseModal
        open={showNewExpenseModal}
        onOpenChange={setShowNewExpenseModal}
        onExpenseCreated={handleExpenseCreated}
      />
    </div>
  );
}



