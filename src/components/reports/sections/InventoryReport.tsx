import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package, Coffee, AlertTriangle, TrendingUp, TrendingDown, DollarSign, RotateCw } from "lucide-react";
import  api  from "@/services/api";
import { Button } from "@/components/ui/button";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface InventoryStats {
  totalValue: number;
  totalProducts: number;
  lowStock: number;
  averageRotation: number;
}

interface ProductCategory {
  name: string;
  count: number;
  value: number;
}

interface Product {
  name: string;
  type: string;
  stock: number;
  minStock: {
    sealed: number;  // Este valor viene de las preferencias del usuario
    prepared: number; // Este valor viene de las preferencias del usuario
  };
  cost: number;
  price: number;
  lastMovement: string;
  rotationDays: number;
  sealed?: number;
  preparation?: {
    currentPortions?: number;
    portionsPerUnit?: number;
    totalUnits?: number;
  };
}

interface InventoryData {
  stats: InventoryStats;
  categories: ProductCategory[];
  products: Product[];
}

export function InventoryReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InventoryData | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const params = {
          clubId: selectedClub
        };
        
        const response = await api.get<InventoryData>('/reports/inventory', { params });
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching inventory data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos de inventario');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [selectedClub]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  const renderStockCell = (product: Product) => {
    if (product.type === 'sealed') {
      return (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{product.sealed || 0}</span>
            <span className="text-sm text-muted-foreground">unidades en stock</span>
          </div>
        </div>
      );
    }

    if (product.type === 'both') {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{product.sealed || 0}</span>
            <span className="text-sm text-muted-foreground">unidades selladas</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm">
              <span className="font-medium">{product.preparation?.currentPortions || 0}</span>
              <span className="text-muted-foreground"> porciones </span>
              <span className="text-muted-foreground">
                ({product.preparation?.units || 0} unidades)
              </span>
            </span>
          </div>
        </div>
      );
    }

    // Para productos preparados
    return (
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <span className="text-sm">
            <span className="font-medium">{product.preparation?.currentPortions || 0}</span>
            <span className="text-muted-foreground"> porciones </span>
            <span className="text-muted-foreground">
              ({product.preparation?.units || 0} unidades)
            </span>
          </span>
        </div>
      </div>
    );
  };

  const formatRotationDays = (days: number) => {
    if (days < 1) {
      return "Menos de un día";
    }
    return `${Math.floor(days)} días`;
  };

  const calculateMargin = (product: Product) => {
    if (product.type === 'sealed') {
      // Para productos sellados: (precio venta - costo) / costo * 100
      return product.cost > 0 ? ((product.price - product.cost) / product.cost) * 100 : 0;
    }
    
    if (product.type === 'both') {
      // Calcular ambos márgenes
      const sealedMargin = product.cost > 0 ? ((product.price - product.cost) / product.cost) * 100 : 0;
      const preparedMargin = product.cost > 0 && product.preparation?.portionsPerUnit 
        ? (((product.preparation.portionsPerUnit * product.price) - product.cost) / product.cost) * 100
        : 0;
      return Math.max(sealedMargin, preparedMargin);
    }
    
    // Para productos preparados
    if (product.cost > 0 && product.preparation?.portionsPerUnit) {
      // Margen preparado: ((porciones por unidad * precio por porción) - costo) / costo * 100
      return ((product.preparation.portionsPerUnit * product.price) - product.cost) / product.cost * 100;
    }
    
    return 0;
  };

  const renderStockStatus = (product: Product) => {
    if (product.type === 'both') {
      const sealedStock = product.sealed || 0;
      const preparedStock = product.preparation?.currentPortions || 0;
      
      const sealedStatus = sealedStock === 0 ? "sin_stock" : 
                          sealedStock < product.minStock.sealed ? "bajo" : "normal";
      const preparedStatus = preparedStock === 0 ? "sin_stock" : 
                           preparedStock < product.minStock.prepared ? "bajo" : "normal";
      
      return (
        <div className="space-y-2">
          <Badge
            variant={sealedStatus === "normal" ? "default" : "destructive"}
            className={
              sealedStatus === "normal"
                ? "bg-green-100 text-green-800"
                : sealedStatus === "bajo"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }
          >
            Sellado: {sealedStatus === "normal" ? "Normal" : sealedStatus === "bajo" ? "Stock Bajo" : "Sin Stock"}
          </Badge>
          <Badge
            variant={preparedStatus === "normal" ? "default" : "destructive"}
            className={
              preparedStatus === "normal"
                ? "bg-green-100 text-green-800"
                : preparedStatus === "bajo"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }
          >
            Preparado: {preparedStatus === "normal" ? "Normal" : preparedStatus === "bajo" ? "Stock Bajo" : "Sin Stock"}
          </Badge>
        </div>
      );
    }

    const currentStock = product.type === 'sealed' 
      ? (product.sealed || 0)
      : (product.preparation?.currentPortions || 0);
    
    const minStock = product.type === 'sealed' 
      ? product.minStock.sealed 
      : product.minStock.prepared;

    const stockStatus = currentStock === 0 ? "sin_stock" : 
                       currentStock < minStock ? "bajo" : "normal";

    return (
      <Badge
        variant={stockStatus === "normal" ? "default" : "destructive"}
        className={
          stockStatus === "normal"
            ? "bg-green-100 text-green-800"
            : stockStatus === "bajo"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
        }
      >
        {stockStatus === "normal" ? "Normal" : stockStatus === "bajo" ? "Stock Bajo" : "Sin Stock"}
      </Badge>
    );
  };

  // Paginación
  const totalPages = Math.ceil((data?.products.length || 0) / itemsPerPage);
  const paginatedProducts = data?.products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Total Value Card */}
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
                ${data.stats.totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {data.stats.totalProducts} productos
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
                {data.stats.lowStock}
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
                {data.stats.averageRotation} días
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
              {data.categories.map((category) => (
                <div key={category.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category.name}</span>
                    <span>{category.count} productos</span>
                  </div>
                  <Progress
                    value={(category.count / data.stats.totalProducts) * 100}
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
            {paginatedProducts?.map((product) => {
              const margin = calculateMargin(product);
              
              return (
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
                  <TableCell>{renderStockCell(product)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 text-muted-foreground" />
                      <span>{formatRotationDays(product.rotationDays)}</span>
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
                  <TableCell>{renderStockStatus(product)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Agregar controles de paginación */}
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}