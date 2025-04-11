import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, TrendingDown, Crown, Users, DollarSign, Star, ArrowRight } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const clubsData = [
  {
    id: "1",
    name: "Club FitZone",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=400&fit=crop",
    totalSales: 85000,
    totalProfit: 35000,
    employeesCount: 12,
    clientsCount: 250,
    rating: 4.8,
    performance: {
      sales: {
        current: 85000,
        previous: 75000,
      },
      profit: {
        current: 35000,
        previous: 30000,
      },
      clients: {
        current: 250,
        previous: 220,
      },
    },
    topProducts: [
      { name: "Fórmula 1", sales: 150 },
      { name: "Proteína", sales: 120 },
      { name: "Té Verde", sales: 90 },
    ],
  },
  {
    id: "2",
    name: "Club VitaFit",
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=400&fit=crop",
    totalSales: 95000,
    totalProfit: 40000,
    employeesCount: 15,
    clientsCount: 300,
    rating: 4.9,
    performance: {
      sales: {
        current: 95000,
        previous: 82000,
      },
      profit: {
        current: 40000,
        previous: 35000,
      },
      clients: {
        current: 300,
        previous: 260,
      },
    },
    topProducts: [
      { name: "Proteína", sales: 180 },
      { name: "Fórmula 1", sales: 130 },
      { name: "Batido", sales: 100 },
    ],
  },
];

export function ClubPerformanceReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [selectedClubId, setSelectedClubId] = useState<string>(clubsData[0].id);
  
  const selectedClubData = clubsData.find(club => club.id === selectedClubId);
  const leaderClub = clubsData.reduce((prev, current) => 
    (current.totalSales > prev.totalSales) ? current : prev
  );

  if (!selectedClubData) return null;

  const calculatePercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Club Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clubsData.map((club) => (
          <div
            key={club.id}
            className={`relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
              selectedClubId === club.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedClubId(club.id)}
          >
            <div className="absolute inset-0">
              <img
                src={club.image}
                alt={club.name}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent"></div>
            </div>
            
            <div className="relative p-6">
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
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.floor(club.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {club.rating}
                  </span>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Métricas Clave</h3>
          <div className="space-y-6">
            {/* Sales Performance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ventas</span>
                <div className="flex items-center gap-2">
                  {calculatePercentageChange(
                    selectedClubData.performance.sales.current,
                    selectedClubData.performance.sales.previous
                  ) > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        +{calculatePercentageChange(
                          selectedClubData.performance.sales.current,
                          selectedClubData.performance.sales.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">
                        {calculatePercentageChange(
                          selectedClubData.performance.sales.current,
                          selectedClubData.performance.sales.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Progress
                value={
                  (selectedClubData.performance.sales.current /
                    leaderClub.performance.sales.current) *
                  100
                }
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${selectedClubData.performance.sales.current.toLocaleString()}</span>
                <span>Meta: ${(selectedClubData.performance.sales.current * 1.2).toLocaleString()}</span>
              </div>
            </div>

            {/* Profit Performance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ganancias</span>
                <div className="flex items-center gap-2">
                  {calculatePercentageChange(
                    selectedClubData.performance.profit.current,
                    selectedClubData.performance.profit.previous
                  ) > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        +{calculatePercentageChange(
                          selectedClubData.performance.profit.current,
                          selectedClubData.performance.profit.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">
                        {calculatePercentageChange(
                          selectedClubData.performance.profit.current,
                          selectedClubData.performance.profit.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Progress
                value={
                  (selectedClubData.performance.profit.current /
                    leaderClub.performance.profit.current) *
                  100
                }
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${selectedClubData.performance.profit.current.toLocaleString()}</span>
                <span>Meta: ${(selectedClubData.performance.profit.current * 1.2).toLocaleString()}</span>
              </div>
            </div>

            {/* Clients Growth */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Crecimiento de Clientes</span>
                <div className="flex items-center gap-2">
                  {calculatePercentageChange(
                    selectedClubData.performance.clients.current,
                    selectedClubData.performance.clients.previous
                  ) > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-500">
                        +{calculatePercentageChange(
                          selectedClubData.performance.clients.current,
                          selectedClubData.performance.clients.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">
                        {calculatePercentageChange(
                          selectedClubData.performance.clients.current,
                          selectedClubData.performance.clients.previous
                        ).toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Progress
                value={
                  (selectedClubData.performance.clients.current /
                    leaderClub.performance.clients.current) *
                  100
                }
                className="h-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{selectedClubData.performance.clients.current} clientes</span>
                <span>Meta: {Math.round(selectedClubData.performance.clients.current * 1.2)}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Productos Más Vendidos</h3>
          <div className="space-y-4">
            {selectedClubData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
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
                <Progress
                  value={(product.sales / selectedClubData.topProducts[0].sales) * 100}
                  className="w-24 h-2"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}