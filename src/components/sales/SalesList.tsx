import React, { useState, useEffect } from 'react';
import { Package, Coffee, User, Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaleDetailsModal } from './modals/SaleDetails';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/services/api';

interface Props {
  activeClub: string;
  dateRange: { start: string; end: string };
}

// Función para ajustar el rango: resta un día a cada fecha y establece las horas
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

export default function SalesList({ activeClub, dateRange }: Props) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (activeClub) {
      fetchSales();
    }
  }, [activeClub, dateRange]);

  // Volver a la primera página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeClub, dateRange]);

  // Actualizar el número total de páginas
  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(sales.length / salesPerPage)));
  }, [sales]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { start, end } = convertRangeForQuery(dateRange);
      const res = await api.get(
        `/sales/summary?clubId=${activeClub}&start=${start}&end=${end}`
      );
      // Mapear las ventas para agregar el id como string
      const mappedSales = res.data.map((sale: any) => ({
        ...sale,
        id: sale._id,
      }));
      setSales(mappedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  // Funciones para la paginación
  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  // Obtener las ventas de la página actual
  const getCurrentPageSales = () => {
    const startIndex = (currentPage - 1) * salesPerPage;
    const endIndex = startIndex + salesPerPage;
    return sales.slice(startIndex, endIndex);
  };

  // Generar los números de página para la paginación
  const getPaginationNumbers = () => {
    const delta = 1;
    const pages = [];
    let start = Math.max(1, currentPage - delta);
    let end = Math.min(totalPages, currentPage + delta);
    
    if (end - start < 2) {
      if (start === 1) {
        end = Math.min(start + 2, totalPages);
      } else {
        start = Math.max(end - 2, 1);
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-muted-foreground">Cargando ventas...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No hay ventas que coincidan con el rango seleccionado</p>
      </div>
    );
  }

  const currentPageSales = getCurrentPageSales();

  return (
    <>
      <div className="divide-y divide-border">
        {currentPageSales.map((sale) => (
          <div key={sale.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-medium">Venta #{sale.id.slice(0, 8)}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {format(new Date(sale.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                  </div>
                </div>
                <div className="space-y-4 mb-3">
                  {sale.itemGroups.map((group: any, groupIndex: number) => (
                    <div key={`${sale.id}-group-${groupIndex}`}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">{group.name}</h4>
                      <div className="space-y-2">
                        {group.items.map((item: any, itemIndex: number) => (
                          <div
                            key={`${sale.id}-group-${groupIndex}-item-${itemIndex}`}
                            className="flex items-center gap-2 text-sm"
                          >
                            {item.type === 'sealed' ? (
                              <Package className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Coffee className="h-4 w-4 text-green-500" />
                            )}
                            <span className="flex-1">
                              {item.product_id.name} - {item.product_id.flavor}
                              <span className="text-muted-foreground ml-1">
                                x{item.quantity}
                                {item.portions && ` (${item.portions} porciones)`}
                              </span>
                            </span>
                            <span className="font-medium">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {sale.employee.avatar ? (
                      <img
                        src={sale.employee.avatar}
                        alt={sale.employee.displayName || sale.employee.nombre}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">
                      {sale.employee.displayName || sale.employee.nombre}
                    </span>
                  </div>
                  {sale.client && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{sale.client.name}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-lg font-semibold">
                  ${sale.total.toFixed(2)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(sale)}
                  className="text-primary hover:text-primary/80"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Componente de paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPaginationNumbers().map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={currentPage === pageNumber ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(pageNumber)}
              className={`min-w-8 ${currentPage === pageNumber ? "pointer-events-none" : ""}`}
            >
              {pageNumber}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div className="text-sm text-muted-foreground ml-2">
            Página {currentPage} de {totalPages}
          </div>
        </div>
      )}
      
      <SaleDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        sale={selectedSale}
      />
    </>
  );
}