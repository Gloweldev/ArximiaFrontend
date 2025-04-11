import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Info, ArrowUpDown } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const mockData = {
  totalSales: 125000,
  previousPeriodSales: 100000,
  operatingExpenses: 75000,
  previousPeriodExpenses: 70000,
  netProfit: 50000,
  previousPeriodProfit: 30000,
  monthlyTrend: [
    { month: 'Ene', sales: 95000, expenses: 70000, profit: 25000 },
    { month: 'Feb', sales: 100000, expenses: 72000, profit: 28000 },
    { month: 'Mar', sales: 110000, expenses: 75000, profit: 35000 },
    { month: 'Abr', sales: 125000, expenses: 75000, profit: 50000 },
  ],
  breakdown: [
    { category: 'Productos Sellados', amount: 75000, previousAmount: 60000 },
    { category: 'Preparaciones', amount: 50000, previousAmount: 40000 },
    { category: 'Compras', amount: -35000, previousAmount: -32000 },
    { category: 'Servicios', amount: -20000, previousAmount: -19000 },
    { category: 'Renta', amount: -20000, previousAmount: -19000 },
  ]
};

export function FinancialReport({ selectedClub, selectedPeriod, dateRange }: Props) {
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

  const sortedBreakdown = [...mockData.breakdown].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = Math.abs(a[sortConfig.key as keyof typeof a] as number);
    const bValue = Math.abs(b[sortConfig.key as keyof typeof b] as number);
    
    if (sortConfig.direction === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });

  const calculatePercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Sales */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ventas Totales
                </h3>
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
              <div className="text-2xl font-bold">
                ${mockData.totalSales.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(mockData.totalSales, mockData.previousPeriodSales) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{calculatePercentageChange(mockData.totalSales, mockData.previousPeriodSales).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      {calculatePercentageChange(mockData.totalSales, mockData.previousPeriodSales).toFixed(1)}%
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

        {/* Operating Expenses */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Gastos Operativos
                </h3>
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
                ${mockData.operatingExpenses.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(mockData.operatingExpenses, mockData.previousPeriodExpenses) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      +{calculatePercentageChange(mockData.operatingExpenses, mockData.previousPeriodExpenses).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      {calculatePercentageChange(mockData.operatingExpenses, mockData.previousPeriodExpenses).toFixed(1)}%
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

        {/* Net Profit */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Ganancias Netas
                </h3>
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
                ${mockData.netProfit.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {calculatePercentageChange(mockData.netProfit, mockData.previousPeriodProfit) > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{calculatePercentageChange(mockData.netProfit, mockData.previousPeriodProfit).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      {calculatePercentageChange(mockData.netProfit, mockData.previousPeriodProfit).toFixed(1)}%
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
      </div>

      {/* Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Tendencia Mensual</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Evolución mensual de ventas, gastos y ganancias</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mockData.monthlyTrend}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
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
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {label}
                            </span>
                          </div>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {entry.name === "sales" ? "Ventas" :
                                 entry.name === "expenses" ? "Gastos" : "Ganancias"}
                              </span>
                              <span className="font-bold">
                                ${entry.value.toLocaleString()}
                              </span>
                            </div>
                          ))}
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
                stroke="hsl(var(--primary))"
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
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('category')}
                  className="hover:bg-transparent"
                >
                  Categoría
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('amount')}
                  className="hover:bg-transparent"
                >
                  Monto Actual
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('previousAmount')}
                  className="hover:bg-transparent"
                >
                  Período Anterior
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Variación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBreakdown.map((item) => {
              const percentageChange = calculatePercentageChange(item.amount, item.previousAmount);
              const isPositive = item.amount >= 0;
              const changeIsPositive = percentageChange > 0;

              return (
                <TableRow key={item.category}>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}{item.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}{item.previousAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {changeIsPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={changeIsPositive ? "text-green-500" : "text-red-500"}>
                        {changeIsPositive ? "+" : ""}{percentageChange.toFixed(1)}%
                      </span>
                    </div>
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