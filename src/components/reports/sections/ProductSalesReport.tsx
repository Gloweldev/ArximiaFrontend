import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Package, Coffee } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const topProducts = [
  { name: "Fórmula 1", sales: 12500, quantity: 25, cost: 600, price: 850, type: "sealed" },
  { name: "Proteína", sales: 10000, quantity: 20, cost: 800, price: 1200, type: "prepared" },
  { name: "Té Verde", sales: 8000, quantity: 18, cost: 500, price: 750, type: "both" },
  // Add more products...
];

const categoryDistribution = [
  { name: "Sellados", value: 45, color: "#3B82F6" },
  { name: "Preparados", value: 55, color: "#10B981" }
];

const lowRotationProducts = [
  { name: "Producto A", lastSold: "15 días", stock: 10, type: "sealed" },
  { name: "Producto B", lastSold: "20 días", stock: 5, type: "prepared" },
  // Add more products...
];

export function ProductSalesReport({ selectedClub, selectedPeriod, dateRange }: Props) {
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
      {/* Top Products Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Top 10 Productos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
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
                  tickFormatter={(value) => `$${value/1000}k`}
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
                              <span className="font-bold">
                                ${payload[0].value.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {payload[0].payload.quantity} unidades
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Distribución por Tipo</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
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
                                {payload[0].value}%
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
      </div>

      {/* Product Details Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Detalle de Productos</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Margen</TableHead>
              <TableHead>Rotación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => {
              const margin = ((product.price - product.cost) / product.cost) * 100;
              
              return (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.type === 'sealed' ? (
                        <Package className="h-4 w-4 text-blue-500" />
                      ) : product.type === 'prepared' ? (
                        <Coffee className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="flex">
                          <Package className="h-4 w-4 text-blue-500" />
                          <Coffee className="h-4 w-4 text-green-500 -ml-2" />
                        </div>
                      )}
                      <span className="capitalize">{product.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>${product.sales.toLocaleString()}</TableCell>
                  <TableCell>{product.quantity} unidades</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {margin > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={margin > 0 ? "text-green-500" : "text-red-500"}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset">
                        Alta
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Low Rotation Products */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Productos con Baja Rotación</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Última Venta</TableHead>
              <TableHead>Stock Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lowRotationProducts.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.type === 'sealed' ? (
                      <Package className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Coffee className="h-4 w-4 text-green-500" />
                    )}
                    <span className="capitalize">{product.type}</span>
                  </div>
                </TableCell>
                <TableCell>Hace {product.lastSold}</TableCell>
                <TableCell>{product.stock} unidades</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}