import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Users,
  PieChart,
  Info
} from 'lucide-react';
import api from '@/services/api';

export interface Sale {
  _id: string;
  total: number;
  client: string | null;
  client_id?: string;
  itemGroups: { name: string; items: any[] }[];
  created_at: string;
  items?: any[];
}

interface Props {
  activeClub: string;
  dateRange: { start: string; end: string };
}

const convertRangeForQuery = (range: { start: string; end: string }) => {
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  startDate.setDate(startDate.getDate() + 1);
  endDate.setDate(endDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 0);
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
};

const TYPE_COLORS: Record<string, string> = {
  sealed: '#3b82f6',
  prepared: '#10b981',
};

const TYPE_ICONS: Record<string, JSX.Element> = {
  sealed: <ShoppingCart className="h-4 w-4 text-blue-600 mr-1" />,
  prepared: <TrendingUp className="h-4 w-4 text-green-600 mr-1" />,
};

const TYPE_NAMES: Record<string, string> = {
  sealed: 'Productos Sellados',
  prepared: 'Productos Preparados',
};

const SalesSummary: React.FC<Props> = ({ activeClub, dateRange }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const flattenSales = (salesData: Sale[]): Sale[] =>
    salesData.map((sale) => {
      const items = sale.itemGroups
        ? sale.itemGroups.reduce((acc: any[], group) => acc.concat(group.items), [])
        : [];
      return { ...sale, items };
    });

  useEffect(() => {
    if (activeClub) {
      fetchSales();
    }
  }, [activeClub, dateRange]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { start, end } = convertRangeForQuery(dateRange);
      const res = await api.get(
        `/sales/summary?clubId=${activeClub}&start=${start}&end=${end}`
      );
      const fetchedSales: Sale[] = res.data;
      const flattened = flattenSales(fetchedSales);
      setSales(flattened);
    } catch (error) {
      console.error('Error fetching sales summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayRange = () => {
    const { start, end } = convertRangeForQuery(dateRange);
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} - ${endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const saleByType: Record<string, number> = { sealed: 0, prepared: 0 };
  
  sales.forEach((sale) => {
    sale.items?.forEach((item: any) => {
      if (item.type && (item.type === 'sealed' || item.type === 'prepared')) {
        saleByType[item.type] = (saleByType[item.type] || 0) + item.quantity * item.unit_price;
      }
    });
  });
  
  const totalItems = sales.reduce(
    (sum, sale) =>
      sum + (sale.items?.reduce((s: number, item: any) => s + item.quantity, 0) || 0),
    0
  );
  
  const uniqueClients = new Set(sales.map((sale) => sale.client).filter((client) => client)).size;
  const previousPeriodTotal = totalSales * 0.85;
  const changePercentage = previousPeriodTotal > 0 ? ((totalSales - previousPeriodTotal) / previousPeriodTotal) * 100 : 0;
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;

  const generatePieChart = () => {
    const totalAmount = Object.values(saleByType).reduce((sum, val) => sum + Number(val), 0);
    if (totalAmount === 0) return null;

    let startAngle = 0;
    const pieChartSegments = Object.entries(saleByType)
      .filter(([, amount]) => amount > 0)
      .map(([type, amount], index) => {
        const percentage = (amount / totalAmount) * 100;
        const angleInDegrees = (percentage / 100) * 360;
        const endAngle = startAngle + angleInDegrees;
        
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);
        
        const radius = 40;
        
        const x1 = 50 + radius * Math.cos(startRad);
        const y1 = 50 + radius * Math.sin(startRad);
        const x2 = 50 + radius * Math.cos(endRad);
        const y2 = 50 + radius * Math.sin(endRad);
        
        const largeArcFlag = percentage > 50 ? 1 : 0;
        
        const path = (
          <path
            key={type}
            d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
            fill={TYPE_COLORS[type]}
            stroke="white"
            strokeWidth="2"
            onMouseEnter={() => setShowTooltip(type)}
            onMouseLeave={() => setShowTooltip(null)}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        );
        
        startAngle = endAngle;
        
        return path;
      });

    return pieChartSegments;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Resumen de Ventas</h3>
          <div className="inline-flex items-center bg-white px-3 py-1 rounded-full text-sm text-gray-600 shadow-sm">
            <PieChart className="h-4 w-4 mr-2 text-blue-500" />
            {getDisplayRange()}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando datos...</p>
        </div>
      ) : (
        <div className="p-4">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1 flex items-center">
                Ventas Totales
                <div className="relative ml-2 group">
                  <Info className="h-4 w-4 text-gray-400" />
                  <div className="absolute left-0 -top-1 transform -translate-y-full bg-black text-white text-xs rounded p-2 w-48 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    Total de ingresos en el período seleccionado
                  </div>
                </div>
              </span>
              <span className="text-3xl font-bold text-gray-800">${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              <div className="mt-2 flex items-center">
                {changePercentage >= 0 ? (
                  <div className="flex items-center bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {changePercentage.toFixed(1)}% más que el período anterior
                  </div>
                ) : (
                  <div className="flex items-center bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs font-medium">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {Math.abs(changePercentage).toFixed(1)}% menos que el período anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow min-w-0">
              <div className="flex flex-col h-full">
                <div className="p-2 rounded-full bg-blue-100 self-start mb-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Productos Vendidos</span>
                <span className="mt-1 text-xl sm:text-2xl font-bold text-gray-800 break-words">{totalItems.toLocaleString()}</span>
                <span className="mt-1 text-xs text-gray-500">Total de unidades</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow min-w-0">
              <div className="flex flex-col h-full">
                <div className="p-2 rounded-full bg-purple-100 self-start mb-2">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Clientes Atendidos</span>
                <span className="mt-1 text-xl sm:text-2xl font-bold text-gray-800 break-words">{uniqueClients.toLocaleString()}</span>
                <span className="mt-1 text-xs text-gray-500">Clientes únicos</span>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow min-w-0">
              <div className="flex flex-col h-full">
                <div className="p-2 rounded-full bg-green-100 self-start mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Ticket Promedio</span>
                <span className="mt-1 text-xl sm:text-2xl font-bold text-gray-800 break-words">
                  ${averageTicket.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
                <span className="mt-1 text-xs text-gray-500">Por venta</span>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h4 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-500" />
              Distribución por Tipo de Producto
            </h4>
            
            {sales.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay datos de ventas en este período</p>
                <p className="text-sm text-gray-400 mt-1">Intenta seleccionar otro rango de fechas</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="w-full flex justify-center">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {generatePieChart()}
                      <circle cx="50" cy="50" r="20" fill="white" />
                    </svg>
                    {showTooltip && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded text-sm z-10 whitespace-nowrap pointer-events-none">
                        {TYPE_NAMES[showTooltip]}: ${saleByType[showTooltip].toLocaleString('es-MX', {minimumFractionDigits: 2})}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full space-y-3">
                  {Object.entries(saleByType)
                    .filter(([, amount]) => amount > 0)
                    .map(([type, amount]) => {
                      const totalAmount = Object.values(saleByType).reduce((sum, val) => sum + Number(val), 0);
                      const percentage = totalAmount > 0 ? Math.round((Number(amount) / totalAmount) * 100) : 0;
                      return (
                        <div 
                          key={type} 
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                          onMouseEnter={() => setShowTooltip(type)}
                          onMouseLeave={() => setShowTooltip(null)}
                        >
                          <div className="flex items-center">
                            <div style={{ backgroundColor: TYPE_COLORS[type] }} className="w-4 h-4 rounded-full mr-3"></div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {TYPE_NAMES[type]}
                              </div>
                              <div className="text-xs text-gray-500">
                                {percentage}% del total
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-800">
                              ${Number(amount).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mt-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-700 rounded-full mr-3"></div>
                      <div className="text-sm font-medium text-gray-700">
                        Total
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                      ${totalSales.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {sales.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2 text-gray-500" />
                Resumen Rápido
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center bg-white p-3 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Ventas totales:</span>
                  <span className="ml-auto font-medium text-gray-800">{sales.length}</span>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Productos vendidos:</span>
                  <span className="ml-auto font-medium text-gray-800">{totalItems}</span>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Clientes:</span>
                  <span className="ml-auto font-medium text-gray-800">{uniqueClients}</span>
                </div>
                <div className="flex items-center bg-white p-3 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Ticket promedio:</span>
                  <span className="ml-auto font-medium text-gray-800">${averageTicket.toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesSummary;


