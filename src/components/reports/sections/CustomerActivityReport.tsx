import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, TrendingDown, User, Calendar, DollarSign, RotateCw } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const customerStats = {
  totalCustomers: 250,
  activeCustomers: 180,
  newCustomers: 30,
  retentionRate: 85
};

const customerTrend = [
  { month: 'Ene', active: 160, new: 25 },
  { month: 'Feb', active: 170, new: 28 },
  { month: 'Mar', active: 180, new: 30 },
  // Add more months...
];

const topCustomers = [
  {
    id: "1",
    name: "Juan Pérez",
    type: "regular",
    lastPurchase: "2024-03-20",
    totalSpent: 5000,
    purchaseCount: 12,
    status: "active"
  },
  {
    id: "2",
    name: "María García",
    type: "wholesale",
    lastPurchase: "2024-03-19",
    totalSpent: 8000,
    purchaseCount: 15,
    status: "active"
  },
  // Add more customers...
];

export function CustomerActivityReport({ selectedClub, selectedPeriod, dateRange }: Props) {
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

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Customers */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Clientes
              </h3>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {customerStats.totalCustomers}
              </div>
              <p className="text-sm text-muted-foreground">
                clientes registrados
              </p>
            </div>
          </div>
        </Card>

        {/* Active Customers */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Clientes Activos
              </h3>
              <User className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {customerStats.activeCustomers}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {((customerStats.activeCustomers / customerStats.totalCustomers) * 100).toFixed(1)}% del total
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* New Customers */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Nuevos Clientes
              </h3>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {customerStats.newCustomers}
              </div>
              <p className="text-sm text-muted-foreground">
                este mes
              </p>
            </div>
          </div>
        </Card>

        {/* Retention Rate */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Tasa de Retención
              </h3>
              <RotateCw className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {customerStats.retentionRate}%
              </div>
              <div className="mt-2">
                <Progress value={customerStats.retentionRate} className="h-2" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Tendencia de Clientes</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customerTrend}>
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
              />
              <Tooltip
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
                                {entry.name === "active" ? "Activos" : "Nuevos"}
                              </span>
                              <span className="font-bold">
                                {entry.value}
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
              <Line
                type="monotone"
                dataKey="active"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Customers Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Clientes Principales</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead>Total Gastado</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {customer.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(customer.lastPurchase).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    ${customer.totalSpent.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.purchaseCount} compras
                </TableCell>
                <TableCell>
                  <Badge
                    variant={customer.status === "active" ? "default" : "secondary"}
                    className={
                      customer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {customer.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}