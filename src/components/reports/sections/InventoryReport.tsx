import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Coffee, AlertTriangle, TrendingUp, TrendingDown, DollarSign, RotateCw } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const inventoryStats = {
  totalValue: 85000,
  totalProducts: 150,
  lowStock: 12,
  averageRotation: 15 // days
};

const productCategories = [
  { name: "Sellados", count: 80, value: 45000 },
  { name: "Preparados", count: 70, value: 40000 }
];

const products = [
  {
    id: "1",
    name: "Fórmula 1",
    type: "sealed",
    stock: 25,
    minStock: 10,
    cost: 600,
    price: 850,
    lastSold: "2024-03-20",
    rotationDays: 7
  },
  {
    id: "2",
    name: "Proteína",
    type: "prepared",
    stock: 15,
    minStock: 8,
    cost: 800,
    price: 1200,
    lastSold: "2024-03-19",
    rotationDays: 5
  },
  // Add more products...
];

export function InventoryReport({ selectedClub, selectedPeriod, dateRange }: Props) {
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
        {/* Total Value */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Valor Total
              </h3>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${inventoryStats.totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {inventoryStats.totalProducts} productos
              </p>
            </div>
          </div>
        </Card>

        {/* Low Stock */}
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10 border-yellow-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Stock Bajo
              </h3>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {inventoryStats.lowStock}
              </div>
              <p className="text-sm text-muted-foreground">
                productos por reabastecer
              </p>
            </div>
          </div>
        </Card>

        {/* Average Rotation */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Rotación Promedio
              </h3>
              <RotateCw className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {inventoryStats.averageRotation} días
              </div>
              <p className="text-sm text-muted-foreground">
                tiempo promedio de venta
              </p>
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Distribución
              </h3>
              <Package className="h-4 w-4 text-purple-500" />
            </div>
            <div className="space-y-2">
              {productCategories.map((category) => (
                <div key={category.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span>{category.count} productos</span>
                  </div>
                  <Progress
                    value={(category.count / inventoryStats.totalProducts) * 100}
                    className="h-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Detalle de Inventario</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rotación</TableHead>
              <TableHead>Rentabilidad</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const margin = ((product.price - product.cost) / product.cost) * 100;
              const stockStatus = product.stock <= product.minStock ? "low" : "normal";
              
              return (
                <TableRow key={product.id}>
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
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{product.stock} unidades</div>
                      <Progress
                        value={(product.stock / (product.minStock * 2)) * 100}
                        className="h-1"
                        indicatorClassName={stockStatus === "low" ? "bg-red-500" : "bg-green-500"}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 text-muted-foreground" />
                      <span>{product.rotationDays} días</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {margin > 30 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={margin > 30 ? "text-green-500" : "text-red-500"}>
                        {margin.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={stockStatus === "normal" ? "default" : "destructive"}
                      className={
                        stockStatus === "normal"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {stockStatus === "normal" ? "Normal" : "Stock Bajo"}
                    </Badge>
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