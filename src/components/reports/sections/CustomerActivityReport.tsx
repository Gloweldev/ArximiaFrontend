import { ReactNode, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, TrendingDown, User, Calendar, DollarSign, RotateCw, ChevronLeft, ChevronRight, Info } from "lucide-react";
import  api  from "@/services/api";
import { Button } from "@/components/ui/button";
import { TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  totalSales: number;
  averageTicket: number;
  purchaseFrequency: number;
}

interface CustomerTrend {
  month: number;
  year: number;
  active: number;
  new: number;
}

interface TopCustomer {
  phone: ReactNode;
  email: any;
  _id: string;
  name: string;
  type: string;
  lastPurchase: string;
  totalSpent: number;
  purchaseCount: number;
  status: 'active' | 'inactive';
}

interface CustomerData {
  stats: CustomerStats;
  trend: CustomerTrend[];
  topCustomers: TopCustomer[];
}

export function CustomerActivityReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CustomerData | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const params = {
          clubId: selectedClub,
          period: selectedPeriod,
          startDate: dateRange.start,
          endDate: dateRange.end
        };
        
        const response = await api.get<CustomerData>('/reports/customer-activity', { params });
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching customer data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos de clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [selectedClub, selectedPeriod, dateRange]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Descripción de la sección */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Actividad de Clientes</h3>
            <p className="text-sm text-muted-foreground">
              Analiza el comportamiento y tendencias de tus clientes, incluyendo frecuencia de compra,
              ticket promedio y patrones de actividad. Esta información te ayudará a identificar
              clientes leales y oportunidades de mejora en tu servicio.
            </p>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                {data.stats.totalCustomers}
              </div>
              <p className="text-sm text-muted-foreground">
                clientes registrados
              </p>
            </div>
          </div>
        </Card>

        {/* Nuevos Clientes */}
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
                {data.stats.newCustomers}
              </div>
              <p className="text-sm text-muted-foreground">
                en este período
              </p>
            </div>
          </div>
        </Card>

        {/* Ticket Promedio */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Ticket Promedio
              </h3>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${data.stats.averageTicket.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                por compra
              </p>
            </div>
          </div>
        </Card>

        {/* Frecuencia de Compra */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10 border-purple-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Frecuencia de Compra
              </h3>
              <RotateCw className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {data.stats.purchaseFrequency.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground">
                compras por cliente
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Trend Chart */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tendencia de Clientes</h3>
          </div>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                                      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return monthNames[value - 1];
                  }}
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
                      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {monthNames[label - 1]}
                              </span>
                            </div>
                            {payload.map((entry) => (
                              <div key={entry.name} className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  {entry.name === "active" ? "Con Compras" : "Nuevos"}
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
                  name="Con Compras"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="new"
                  name="Nuevos"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Customers Table */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Clientes Principales</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Última Compra</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden sm:table-cell">Compras</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topCustomers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-sm">
                        {customer.email && <span>{customer.email}</span>}
                        {customer.phone && <span>{customer.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="capitalize">
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {customer.lastPurchase 
                          ? new Date(customer.lastPurchase).toLocaleDateString()
                          : "Sin compras"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        ${customer.totalSpent?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {customer.purchaseCount || 0} compras
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === "active" ? "default" : "secondary"}
                        className={
                          customer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : customer.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {customer.status === "active" 
                          ? "Activo" 
                          : customer.status === "inactive"
                          ? "Inactivo"
                          : "Sin compras"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Agregar controles de paginación */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {Math.ceil(data.topCustomers.length / itemsPerPage)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(data.topCustomers.length / itemsPerPage), p + 1))}
            disabled={currentPage === Math.ceil(data.topCustomers.length / itemsPerPage)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

    </div>
  );
}