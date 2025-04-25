import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShoppingBag, Building2, Zap, Users, Bookmark, TrendingDown, TrendingUp } from "lucide-react";
import api from "@/services/api";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ExpenseData {
  totalExpenses: number;
  previousTotalExpenses: number;
  categoryDistribution: {
    name: string;
    value: number;
  }[];
  topExpenses: {
    _id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
  }[];
}

// Mapa para normalizar categorías
const normalizeCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    purchase: "Producto",
    producto: "Producto",
    services: "Servicios",
    rent: "Renta",
    operational: "Operacional",
    salary: "Salarios"
  };

  return categoryMap[category.toLowerCase()] || category;
};

// Actualiza los iconos y colores para incluir las nuevas categorías
const categoryIcons = {
  "Producto": ShoppingBag,
  "Operacional": Building2,
  "Servicios": Zap,
  "Salarios": Users,
  "Renta": Building2,
  "other": Bookmark
};

const categoryColors = {
  "Producto": "#3B82F6",    // Azul
  "Operacional": "#10B981", // Verde
  "Servicios": "#8B5CF6",   // Púrpura
  "Salarios": "#F59E0B",    // Ámbar
  "Renta": "#EC4899",       // Rosa
  "other": "#64748B"        // Gris
};

export function ExpensesReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExpenseData | null>(null);

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        setLoading(true);
        const params = {
          clubId: selectedClub,
          period: selectedPeriod,
          startDate: dateRange.start,
          endDate: dateRange.end
        };

        const response = await api.get<ExpenseData>('/reports/expenses', { params });
        
        // Normalizar las categorías en los datos recibidos
        const normalizedData = {
          ...response.data,
          categoryDistribution: normalizeCategories(response.data.categoryDistribution),
          topExpenses: response.data.topExpenses.map(expense => ({
            ...expense,
            category: normalizeCategory(expense.category)
          }))
        };
        
        setData(normalizedData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching expenses data:", err);
        setError(err.response?.data?.message || "Error al cargar los datos de gastos");
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesData();
  }, [selectedClub, selectedPeriod, dateRange]);

  // Función para normalizar y agrupar categorías en la distribución
  const normalizeCategories = (categories: {name: string, value: number}[]) => {
    const categoryMap = new Map<string, number>();
    
    categories.forEach(category => {
      const normalizedName = normalizeCategory(category.name);
      const currentValue = categoryMap.get(normalizedName) || 0;
      categoryMap.set(normalizedName, currentValue + category.value);
    });
    
    return Array.from(categoryMap).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  const percentageChange = ((data.totalExpenses - data.previousTotalExpenses) / data.previousTotalExpenses) * 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Total Expenses Card */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Gastos Totales
              </h3>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                ${data.totalExpenses.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {percentageChange > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      +{percentageChange.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {percentageChange.toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">
                  vs período anterior
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Highest Expense Card */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border-orange-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Mayor Gasto
              </h3>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                {(() => {
                  const normalizedCategory = normalizeCategory(data.topExpenses[0].category);
                  const CategoryIcon = categoryIcons[normalizedCategory as keyof typeof categoryIcons] || Bookmark;
                  return <CategoryIcon className="h-4 w-4 text-orange-600" />;
                })()}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${data.topExpenses[0].amount.toLocaleString()}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-sm font-medium">
                  {data.topExpenses[0].description}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(data.topExpenses[0].date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Distribución por Categoría</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.name as keyof typeof categoryColors] || categoryColors.other} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const total = data.categoryDistribution.reduce((sum, cat) => sum + cat.value, 0);
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {payload[0].name}
                              </span>
                              <span className="font-bold">
                                ${payload[0].value.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {((payload[0].value / total) * 100).toFixed(1)}%
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Resumen por Categoría</h3>
          <div className="space-y-4">
            {data.categoryDistribution.map((category) => {
              const Icon = categoryIcons[category.name as keyof typeof categoryIcons] || Bookmark;
              const percentage = (category.value / data.totalExpenses) * 100;
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${categoryColors[category.name as keyof typeof categoryColors] || categoryColors.other}20` }}>
                        <Icon className="h-4 w-4" style={{ color: categoryColors[category.name as keyof typeof categoryColors] || categoryColors.other }} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="font-medium">${category.value.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% del total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Expenses Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Gastos más Altos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.topExpenses.map((expense) => {
              const normalizedCategory = normalizeCategory(expense.category);
              const Icon = categoryIcons[normalizedCategory as keyof typeof categoryIcons] || Bookmark;
              
              return (
                <TableRow key={expense._id}>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div className="p-1 rounded-lg" style={{ backgroundColor: `${categoryColors[normalizedCategory as keyof typeof categoryColors] || categoryColors.other}20` }}>
                          <Icon className="h-4 w-4" style={{ color: categoryColors[normalizedCategory as keyof typeof categoryColors] || categoryColors.other }} />
                        </div>
                      )}
                      {normalizedCategory}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}