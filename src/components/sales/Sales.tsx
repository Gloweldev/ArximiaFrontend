import React, { useState, useEffect } from 'react';
import { Plus, Download, Calendar } from 'lucide-react';
import SalesList from './SalesList';
import { NewSaleModal } from './modals/NewSale';
import SalesSummary from './SalesSummary';
import api from '@/services/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useClub } from '@/context/ClubContext';

// Función para ajustar el rango: se resta un día a cada fecha y se establecen las horas
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

export default function Sales() {
  const { activeClub } = useClub();
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: startOfMonth.toISOString().split('T')[0],
    end: endOfMonth.toISOString().split('T')[0],
  });
  const [clubData, setClubData] = useState<any>(null);

  // Obtener datos del club
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const res = await api.get(`/clubs/${activeClub}`);
        setClubData(res.data);
      } catch (error) {
        console.error('Error fetching club data:', error);
        toast.error('Error al obtener datos del club');
      }
    };
    if (activeClub) {
      fetchClubData();
    }
  }, [activeClub]);

  // Función para exportar datos
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const { start, end } = convertRangeForQuery(dateRange);
      const res = await api.get(
        `/sales/summary?clubId=${activeClub}&start=${start}&end=${end}`
      );
      const sales = res.data;

      // Preparar datos para el reporte
      const reportData: any[] = [];
      let grandTotal = 0;

      sales.forEach((sale: any) => {
        const saleId = sale.id ? sale.id.slice(0, 8) : sale._id.toString().slice(0, 8);
        const saleDate = new Date(sale.created_at).toLocaleDateString('es-MX');
        const employeeName = sale.employee?.displayName || sale.employee?.nombre || 'N/D';
        const clientName = sale.client?.name || sale.client_id || 'N/D';

        sale.itemGroups.forEach((group: any) => {
          group.items.forEach((item: any) => {
            const productName = `${item.product_id.name} - ${item.product_id.flavor}`;
            const quantity = item.quantity;
            const unitPrice = item.unit_price;
            const itemTotal = quantity * unitPrice;
            grandTotal += itemTotal;

            reportData.push({
              'ID Venta': saleId,
              'Fecha': saleDate,
              'Empleado': employeeName,
              'Cliente': clientName,
              'Grupo': group.name,
              'Producto': productName,
              'Cantidad': quantity,
              'Precio Unitario': unitPrice,
              'Total Item': itemTotal,
            });
          });
        });
      });

      // Agregar fila de total general
      reportData.push({
        'ID Venta': '',
        'Fecha': '',
        'Empleado': '',
        'Cliente': '',
        'Grupo': '',
        'Producto': 'Total General',
        'Cantidad': '',
        'Precio Unitario': '',
        'Total Item': grandTotal,
      });

      const exportDate = new Date().toLocaleDateString('es-MX');
      const clubOwnerName = clubData?.owner?.name || 'Desconocido';

      if (format === 'pdf') {
        const doc = new jsPDF();
        const title = `Reporte de Ventas - Club ${activeClub}`;
        const subtitle = `Dueño: ${clubOwnerName} | Período: ${dateRange.start} - ${dateRange.end} | Exportado el: ${exportDate}`;
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(12);
        doc.text(subtitle, 14, 28);
        const tableColumn = [
          'ID Venta',
          'Fecha',
          'Empleado',
          'Cliente',
          'Grupo',
          'Producto',
          'Cantidad',
          'Precio Unitario',
          'Total Item',
        ];
        const tableRows = reportData.map((row) => [
          row['ID Venta'],
          row['Fecha'],
          row['Empleado'],
          row['Cliente'],
          row['Grupo'],
          row['Producto'],
          row['Cantidad'],
          row['Precio Unitario'],
          row['Total Item'],
        ]);
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          styles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 30 },
            6: { cellWidth: 15 },
            7: { cellWidth: 20 },
            8: { cellWidth: 20 },
          },
        });
        doc.save(`Ventas_${dateRange.start}_a_${dateRange.end}.pdf`);
        toast.success('Exportado a PDF');
      } else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        });
        saveAs(dataBlob, `Ventas_${dateRange.start}_a_${dateRange.end}.xlsx`);
        toast.success('Exportado a Excel');
      }
    } catch (error: any) {
      console.error('Error exportando ventas:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handleSaveSale = () => {
    toast.success('Venta registrada correctamente');
    setShowNewSaleModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        {/* Header y Controles */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Registro de Ventas
              </h1>
              <p className="text-muted-foreground">
                Gestiona y monitorea todas las ventas realizadas
              </p>
            </div>
            <button
              onClick={() => setShowNewSaleModal(true)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Venta
            </button>
          </div>

          {/* Controles: Rango de Fechas y Exportación */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Rango de Fechas */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-card rounded-xl shadow-sm border p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Fecha Inicio</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Fecha Fin</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full rounded-lg border bg-background px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Exportar */}
            <div>
              <div className="bg-card rounded-xl shadow-sm border p-4">
                <label className="text-sm font-medium block mb-2">Exportar Datos</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                      <Download className="h-4 w-4" />
                      <span>Exportar</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                      <span className="mr-2">📊</span>
                      Exportar a Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      <span className="mr-2">📄</span>
                      Exportar a PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesList
              activeClub={activeClub}
              dateRange={dateRange}
              key={`list-${refreshKey}`}
            />
          </div>
          <div className="lg:col-span-1">
            <SalesSummary
              activeClub={activeClub}
              dateRange={dateRange}
              key={`summary-${refreshKey}`}
            />
          </div>
        </div>

        <NewSaleModal
          open={showNewSaleModal}
          onOpenChange={setShowNewSaleModal}
          onSave={handleSaveSale}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}