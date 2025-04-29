import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, TrendingDown, Crown, Users, DollarSign, Star, ArrowRight } from "lucide-react";
import  api  from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface ClubData {
  id: string;
  name: string;
  image: string;
  totalSales: number;
  totalProfit: number;
  employeesCount: number;
  clientsCount: number;
  rating: number;
  performance: {
    sales: {
      current: number;
      previous: number;
    };
    profit: {
      current: number;
      previous: number;
    };
    clients: {
      current: number;
      previous: number;
    };
  };
  topProducts: Array<{
    name: string;
    sales: number;
  }>;
}

export function ClubPerformanceReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubsData, setClubsData] = useState<ClubData[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>("");

  useEffect(() => {
    const fetchClubPerformance = async () => {
      try {
        setLoading(true);
        const response = await api.get<ClubData[]>('/reports/club-performance', {
          params: {
            period: selectedPeriod,
            startDate: dateRange.start,
            endDate: dateRange.end
          }
        });
        setClubsData(response.data);
        if (response.data.length > 0) {
          setSelectedClubId(response.data[0].id);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching club performance:', err);
        setError(err.response?.data?.message || 'Error al cargar datos de rendimiento');
      } finally {
        setLoading(false);
      }
    };

    fetchClubPerformance();
  }, [selectedPeriod, dateRange]);

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || clubsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        {error || 'No hay datos disponibles'}
      </div>
    );
  }

  const selectedClubData = clubsData.find(club => club.id === selectedClubId);
  const leaderClub = clubsData.reduce((prev, current) => 
    (current.totalSales > prev.totalSales) ? current : prev
  );

  if (!selectedClubData) return null;

  const calculatePercentageChange = (current: number, previous: number) => {
    // Si no hay valores previos o actuales, retornar 0
    if (previous === 0 && current === 0) return 0;
    // Si solo hay valor actual pero no previo, es un incremento del 100%
    if (previous === 0) return current > 0 ? 100 : -100;
    // Cálculo normal del porcentaje
    return ((current - previous) / previous) * 100;
  };

  const calculatePerformanceMetrics = (club: ClubData) => {
    // Calcular métricas adicionales
    const salesPerEmployee = club.employeesCount ? club.totalSales / club.employeesCount : 0;
    const profitMargin = club.totalSales ? (club.totalProfit / club.totalSales) * 100 : 0;
    const averageTicket = club.clientsCount ? club.totalSales / club.clientsCount : 0;

    return {
      salesPerEmployee,
      profitMargin,
      averageTicket
    };
  };

  return (
    <div className="space-y-6">
      {/* Club Cards - Modificados sin imagen de fondo y estrellas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clubsData.map((club) => (
          <div
            key={club.id}
            className={`relative rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
              selectedClubId === club.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedClubId(club.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{club.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {club.employeesCount} empleados
                    </div>
                  </div>
                </div>
                {club.id === leaderClub.id && (
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Crown className="h-4 w-4 mr-1" />
                    Líder
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Ventas Totales</div>
                  <div className="text-2xl font-bold">${club.totalSales.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ganancias</div>
                  <div className="text-2xl font-bold">${club.totalProfit.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {club.clientsCount} clientes registrados
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Métricas Principales - Modificadas y nuevas métricas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Métricas Clave</h3>
          <div className="space-y-6">
            {selectedClubData && (
              <>
                {/* Ventas por Empleado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ventas por Empleado</span>
                    <span className="text-sm font-medium">
                      ${calculatePerformanceMetrics(selectedClubData).salesPerEmployee.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(calculatePerformanceMetrics(selectedClubData).salesPerEmployee / 
                           calculatePerformanceMetrics(leaderClub).salesPerEmployee) * 100}
                    className="h-2"
                  />
                </div>

                {/* Margen de Beneficio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Margen de Beneficio</span>
                    <span className="text-sm font-medium">
                      {calculatePerformanceMetrics(selectedClubData).profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={calculatePerformanceMetrics(selectedClubData).profitMargin}
                    className="h-2"
                  />
                </div>

                {/* Ticket Promedio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ticket Promedio</span>
                    <span className="text-sm font-medium">
                      ${calculatePerformanceMetrics(selectedClubData).averageTicket.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(calculatePerformanceMetrics(selectedClubData).averageTicket / 
                           calculatePerformanceMetrics(leaderClub).averageTicket) * 100}
                    className="h-2"
                  />
                </div>

                {/* Tasa de Crecimiento de Clientes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Crecimiento de Clientes</span>
                    <div className="flex items-center gap-2">
                      {calculatePercentageChange(
                        selectedClubData.performance.clients.current,
                        selectedClubData.performance.clients.previous
                      ) > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ${
                        calculatePercentageChange(
                          selectedClubData.performance.clients.current,
                          selectedClubData.performance.clients.previous
                        ) > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {calculatePercentageChange(
                          selectedClubData.performance.clients.current,
                          selectedClubData.performance.clients.previous
                        ).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Productos Más Vendidos - Con más detalles */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {selectedClubData?.topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  index === 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : index === 1
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {index === 0 ? (
                    <Crown className="h-5 w-5" />
                  ) : (
                    <DollarSign className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.sales} unidades vendidas
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {((product.sales / selectedClubData.topProducts[0].sales) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Nueva sección: Comparativa entre Clubs */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Comparativa entre Clubs</h3>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Club</TableHead>
                <TableHead>Ventas</TableHead>
                <TableHead>Ganancias</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead>Clientes</TableHead>
                <TableHead>Empleados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubsData.map((club) => {
                const metrics = calculatePerformanceMetrics(club);
                return (
                  <TableRow key={club.id}>
                    <TableCell className="font-medium">{club.name}</TableCell>
                    <TableCell>${club.totalSales.toLocaleString()}</TableCell>
                    <TableCell>${club.totalProfit.toLocaleString()}</TableCell>
                    <TableCell>{metrics.profitMargin.toFixed(1)}%</TableCell>
                    <TableCell>{club.clientsCount}</TableCell>
                    <TableCell>{club.employeesCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}