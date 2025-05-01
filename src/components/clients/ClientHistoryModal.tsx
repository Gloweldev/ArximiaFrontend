// components/clients/ClientHistoryModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Client } from '../../types/clients';
import { Sale } from '../../types/sales';
import api from '@/services/api';

interface Props {
  client: Client;
  onClose: () => void;
}

export default function ClientHistoryModal({ client, onClose }: Props) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadClientSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  const loadClientSales = async () => {
    try {
      setLoading(true);
      const activeClub = localStorage.getItem('activeClub');
      if (!activeClub) {
        console.error("Club activo no definido");
        return;
      }
      // Se utiliza la ruta del endpoint de ventas
      const clientId = client._id || client.id;
      const res = await api.get(`/clients/client/${clientId}`, { params: { clubId: activeClub } });
      setSales(res.data);
    } catch (error) {
      console.error('Error loading client sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calcula los productos más comprados usando la propiedad productName
  const getMostPurchasedProducts = () => {
    const productCounts: Record<string, { count: number; name: string }> = {};

    sales.forEach(sale => {
      sale.items?.forEach(item => {
        const productId = String(item.product_id);
        const productName = item.productName || 'Desconocido';
        if (!productCounts[productId]) {
          productCounts[productId] = { count: 0, name: String(productName) };
        }
        productCounts[productId].count += item.quantity;
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  // Datos de gastos mensuales para el gráfico (últimos 6 meses)
  const getMonthlySpending = () => {
    const months: Record<string, number> = {};
    const now = new Date();

    // Inicializa los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months[monthKey] = 0;
    }

    // Acumula los totales por mes
    sales.forEach(sale => {
      const date = new Date(sale.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (months[monthKey] !== undefined) {
        months[monthKey] += sale.total;
      }
    });

    return Object.entries(months).map(([key, value]) => {
      const [year, month] = key.split('-').map(Number);
      const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-MX', { month: 'short' });
      return { month: monthName, amount: value };
    });
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sales.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const monthlyData = getMonthlySpending();
  const mostPurchased = getMostPurchasedProducts();
  const maxMonthlyAmount = Math.max(...monthlyData.map(d => d.amount), 1);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            Historial de Cliente: {client.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-4">
          {/* Summary Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-[#6F42C1] mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de registro</p>
                  <p className="font-medium">
                    {formatDate(client.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-[#28A745] mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total gastado</p>
                  <p className="font-medium">${client.total_spent.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-[#2A5C9A] mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Compras realizadas</p>
                  <p className="font-medium">{sales.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de gastos mensuales */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Gastos Mensuales</h4>
            <div className="h-32 flex items-end space-x-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-[#28A745] bg-opacity-70 rounded-t"
                    style={{ 
                      height: `${(data.amount / maxMonthlyAmount) * 100}%`,
                      minHeight: data.amount > 0 ? '4px' : '0'
                    }}
                  ></div>
                  <div className="text-xs mt-1 text-gray-600">{data.month}</div>
                  <div className="text-xs font-medium">${data.amount.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Productos más comprados */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Productos más comprados</h4>
            <div className="space-y-2">
              {mostPurchased.length > 0 ? (
                mostPurchased.map((product, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className="bg-[#6F42C1] h-2.5 rounded-full" 
                        style={{ width: `${(product.count / mostPurchased[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm whitespace-nowrap">
                      {product.name} ({product.count})
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay compras registradas</p>
              )}
            </div>
          </div>

          {/* Tabla de ventas */}
          <h4 className="text-md font-medium mb-3">Historial de Compras</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.length > 0 ? (
                  getCurrentPageData().map((sale) => (
                    <tr key={sale._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(sale.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.items?.slice(0, 2).map((item, index) => (
                          <div key={index}>
                            {item.productName} 
                            {item.flavor && item.flavor !== 'Sin sabor' && ` (${item.flavor})`} x{item.quantity}
                          </div>
                        ))}
                        {sale.items && sale.items.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{sale.items.length - 2} más
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay compras registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Añadir controles de paginación */}
            {sales.length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalle de venta */}
        {selectedSale && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">
                  Detalle de Venta #{selectedSale._id.slice(0, 8)}
                </h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatDate(selectedSale.created_at)}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Productos</p>
                  <div className="space-y-2">
                    {selectedSale.items?.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          {item.productName}
                          {item.flavor && item.flavor !== 'Sin sabor' && (
                            <span className="text-gray-500"> ({item.flavor})</span>
                          )} x{item.quantity}
                        </div>
                        <div>${(item.quantity * item.unit_price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4 flex justify-between font-medium">
                  <div>Total</div>
                  <div>${selectedSale.total.toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#2A5C9A] text-base font-medium text-white hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedSale(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

