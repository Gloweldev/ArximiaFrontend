import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ShoppingBag, Building2, Zap, Users, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const expensesByCategory = [
  { name: "Compras", value: 45000, color: "#3B82F6", icon: ShoppingBag },
  { name: "Servicios", value: 25000, color: "#10B981", icon: Zap },
  { name: "Salarios", value: 30000, color: "#8B5CF6", icon: Users },
  { name: "Renta", value: 20000, color: "#F59E0B", icon: Building2 },
];

const monthlyGoal = {
  target: 100000,
  current: 120000
};

const topExpenses = [
  { id: "1", description: "Compra de inventario", category: "Compras", amount: 15000, date: "2024-03-20" },
  { id: "2", description: "Pago de renta", category: "Renta", amount: 12000, date: "2024-03-15" },
  { id: "3", description: "Servicios públicos", category: "Servicios", amount: 8000, date: "2024-03-10" },
  { id: "4", description: "Nómina", category: "Salarios", amount: 10000, date: "2024-03-05" },
  { id: "5", description: "Mantenimiento", category: "Servicios", amount: 5000, date: "2024-03-01" },
];

export function ExpensesReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const totalExpenses = expensesByCategory.reduce((sum, category) => sum + category.value, 0);
  const previousPeriodExpenses = 95000; // Mock data
  const percentageChange = ((totalExpenses - previousPeriodExpenses) / previousPeriodExpenses) * 100;
  const goalProgress = (monthlyGoal.current / monthlyGoal.target) * 100;
  const isOverBudget = monthlyGoal.current > monthlyGoal.target;
  
  // Find highest expense
  const highestExpense = topExpenses.reduce((max, expense) => 
    expense.amount > max.amount ? expense : max
  , topExpenses[0]);

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
                ${totalExpenses.toLocaleString()}
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
                  const CategoryIcon = expensesByCategory.find(
                    cat => cat.name === highestExpense.category
                  )?.icon || ShoppingBag;
                  return <CategoryIcon className="h-4 w-4 text-orange-600" />;
                })()}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                ${highestExpense.amount.toLocaleString()}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-sm font-medium">
                  {highestExpense.description}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(highestExpense.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Meta Mensual de Gastos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meta</p>
              <p className="text-2xl font-bold">${monthlyGoal.target.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Real</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">${monthlyGoal.current.toLocaleString()}</p>
                {isOverBudget ? (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
                {goalProgress.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={goalProgress}
              className="h-2"
              indicatorClassName={isOverBudget ? "bg-red-500" : "bg-green-500"}
            />
          </div>
        </div>
      </Card>

      {/* Expenses Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Distribución por Categoría</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
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
                                {((payload[0].value / totalExpenses) * 100).toFixed(1)}%
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
            {expensesByCategory.map((category) => {
              const Icon = category.icon;
              const percentage = (category.value / totalExpenses) * 100;
              
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <Icon className="h-4 w-4" style={{ color: category.color }} />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className="font-medium">${category.value.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={percentage} className="h-1" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% del total</span>
                      <span>{category.value / monthlyGoal.target * 100}% de la meta</span>
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
            {topExpenses.map((expense) => {
              const categoryInfo = expensesByCategory.find(cat => cat.name === expense.category);
              const Icon = categoryInfo?.icon;
              
              return (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {Icon && (
                        <div className="p-1 rounded-lg" style={{ backgroundColor: `${categoryInfo.color}20` }}>
                          <Icon className="h-4 w-4" style={{ color: categoryInfo.color }} />
                        </div>
                      )}
                      {expense.category}
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