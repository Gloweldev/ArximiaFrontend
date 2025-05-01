import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Package, Coffee, Info } from "lucide-react";
import api from "@/services/api";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ProductReportData {
  topProducts: {
    _id: string;
    name: string;
    totalSales: number;
    quantity: number;
    type: string;
    cost: number;
    price: number;
  }[];
  categoryDistribution: {
    _id: string;
    count: number;
    color?: string;
  }[];
  typeDistribution: {
    _id: string;
    count: number;
    color?: string;
  }[];
  lowRotationProducts: {
    name: string;
    type: string;
    stock: number;
    lastMovement: string;
  }[];
}

// Componente personalizado para el tooltip del BarChart
const CustomBarTooltip = ({ active, payload, label }) => {
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
};

// Componente personalizado para el tooltip del PieChart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const total = data.total || 1; // Evita división por cero
    const percentage = ((data.value / total) * 100).toFixed(1);
    
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <div className="grid gap-1">
          <div className="font-medium">{data.name}</div>
          <div className="text-sm text-muted-foreground">
            {data.value.toLocaleString()} productos ({percentage}%)
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function ProductSalesReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProductReportData | null>(null);
  const [distributionView, setDistributionView] = useState<'category' | 'type'>('category');
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentLowRotationPage, setCurrentLowRotationPage] = useState(1);
  const productsPerPage = 7;
  const lowRotationPerPage = 7;

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const params = {
          clubId: selectedClub,
          period: selectedPeriod,
          startDate: dateRange.start,
          endDate: dateRange.end
        };

        const response = await api.get<ProductReportData>('/reports/products', { params });
        
        // Asignar colores a la distribución por tipo
        const typeColors = {
          sealed: "#3B82F6",
          prepared: "#10B981",
          both: "#6366F1"
        };

        const enrichedData = {
          ...response.data,
          typeDistribution: response.data.typeDistribution.map(type => ({
            ...type,
            color: typeColors[type._id as keyof typeof typeColors]
          }))
        };

        setData(enrichedData);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching product data:", err);
        setError(err.response?.data?.message || "Error al cargar los datos de productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [selectedClub, selectedPeriod, dateRange]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  // Calcular margen para cada producto
  const calculateMargin = (cost: number, price: number) => {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  };

  // Calcular días desde última venta
  const getDaysSinceLastSale = (lastMovement: string) => {
    const days = Math.floor((new Date().getTime() - new Date(lastMovement).getTime()) / (1000 * 3600 * 24));
    return `${days} días`;
  };

  const getDistributionData = () => {
    if (!data) return [];
    const distribution = distributionView === 'category' ? data.categoryDistribution : data.typeDistribution;

    const colors = {
      category: [
        "#3B82F6", "#10B981", "#6366F1", "#EC4899", "#F59E0B",
        "#8B5CF6", "#14B8A6", "#D946EF", "#84CC16", "#F97316"
      ],
      type: {
        sealed: "#3B82F6",
        prepared: "#10B981",
        both: "#6366F1"
      }
    };

    // Calculamos el total para los porcentajes en el tooltip
    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    return distribution.map((item, index) => ({
      ...item,
      // Agregar nombres descriptivos para tipos
      name: distributionView === 'type' 
        ? {
            'sealed': 'Productos Sellados (sin preparación)',
            'prepared': 'Productos Preparados (bebidas, platillos)',
            'both': 'Ambos tipos (sellados y preparados)'
          }[item._id] || item._id
        : item._id, // Para categorías, usar el nombre directo
      value: item.count, // Agregar value para la gráfica
      total, // Añadir el total para calcular porcentajes
      color: distributionView === 'category' 
        ? colors.category[index % colors.category.length]
        : colors.type[item._id as keyof typeof colors.type]
    }));
  };

  const noDataDisplay = (
    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
      <p className="text-lg">No hay datos disponibles</p>
      <p className="text-sm">Selecciona otro período o club para ver información</p>
    </div>
  );

  // Pagination calculations
  const productPages = Math.ceil((data?.topProducts?.length || 0) / productsPerPage);
  const lowRotationPages = Math.ceil((data?.lowRotationProducts?.length || 0) / lowRotationPerPage);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Descripción de la sección */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">Ventas por Producto</h3>
              <p className="text-sm text-muted-foreground">
                Explora el rendimiento detallado de cada producto, identificando los más vendidos,
                su rentabilidad y patrones de rotación. Optimiza tu inventario y estrategias de
                venta basándote en datos concretos.
              </p>
            </div>
          </div>
        </Card>

        {/* Mejora del grid de gráficas */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Top Products Chart - ajustado para mejor responsividad */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-medium mb-6">Top 5 Productos</h3>
            <div className="w-full min-h-[350px] h-[350px]">
              {data?.topProducts?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topProducts}
                    margin={{ top: 5, right: 30, left: 20, bottom: 90 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={90}
                      tickFormatter={(value) => {
                        // Limitar a 25 caracteres y agregar elipsis si es necesario
                        return value.length > 25 ? value.substring(0, 25) + '...' : value;
                      }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <RechartsTooltip content={<CustomBarTooltip active={undefined} payload={undefined} label={undefined} />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="totalSales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : noDataDisplay}
            </div>
          </Card>

          {/* Distribution Chart - ajustado para mejor responsividad */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Distribución de Productos</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{distributionView === 'category' 
                      ? 'Distribución de productos por categoría de venta'
                      : 'Distribución por tipo de producto (sellado o preparado)'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                defaultValue="category"
                value={distributionView}
                onValueChange={(value) => setDistributionView(value as 'category' | 'type')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="category" id="category" />
                  <Label htmlFor="category">Por Categoría</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="type" id="type" />
                  <Label htmlFor="type">Por Tipo</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="w-full min-h-[350px] h-[350px]">
              {getDistributionData().length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDistributionData()}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                    >
                      {getDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{
                        paddingTop: "20px"
                      }}
                      formatter={(value) => (
                        <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                          {value}
                        </span>
                      )}
                    />
                    <RechartsTooltip content={<CustomPieTooltip active={undefined} payload={undefined} />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : noDataDisplay}
            </div>
          </Card>
        </div>

        {/* Product Details Table with Pagination */}
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
              {data?.topProducts
                ?.slice((currentProductPage - 1) * productsPerPage, currentProductPage * productsPerPage)
                .map((product) => {
                  const margin = calculateMargin(product.cost, product.price);
                  
                  return (
                    <TableRow key={product._id}>
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
                      <TableCell>${product.totalSales.toLocaleString()}</TableCell>
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
          {data?.topProducts?.length > productsPerPage && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentProductPage(p => Math.max(1, p - 1))}
                disabled={currentProductPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentProductPage} de {productPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentProductPage(p => Math.min(productPages, p + 1))}
                disabled={currentProductPage === productPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </Card>

        {/* Low Rotation Products Table with Pagination */}
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
              {data?.lowRotationProducts
                ?.slice((currentLowRotationPage - 1) * lowRotationPerPage, currentLowRotationPage * lowRotationPerPage)
                .map((product) => (
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
                    <TableCell>{getDaysSinceLastSale(product.lastMovement)}</TableCell>
                    <TableCell>{product.stock} unidades</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          {data?.lowRotationProducts?.length > lowRotationPerPage && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLowRotationPage(p => Math.max(1, p - 1))}
                disabled={currentLowRotationPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentLowRotationPage} de {lowRotationPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLowRotationPage(p => Math.min(lowRotationPages, p + 1))}
                disabled={currentLowRotationPage === lowRotationPages}
              >
                Siguiente
              </Button>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
}