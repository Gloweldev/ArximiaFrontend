// frontend/src/components/Reports.tsx
import React, { useState, useEffect } from 'react';
import { FileBarChart2, Download, ChevronDown, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from '@/hooks/useUser'; // Nuevo hook para obtener info del usuario
import { exportReport } from '@/services/export-service';

import { FinancialReport } from "./sections/FinancialReport";
import { ProductSalesReport } from "./sections/ProductSalesReport";
import { ExpensesReport } from "./sections/ExpensesReport";
import { CashFlowReport } from "./sections/CashFlowReport";
import { InventoryReport } from "./sections/InventoryReport";
import { CustomerActivityReport } from "./sections/CustomerActivityReport";
import { TransactionHistoryReport } from "./sections/TransactionHistoryReport";
import { ClubPerformanceReport } from "./sections/ClubPerformanceReport";
import api from '@/services/api';
import { useClub } from '@/context/ClubContext';

type Club = { _id: string; nombre: string };

interface UserInfo {
  nombreCompleto: string;
  email: string;
  role: string;
}

export default function Reports() {
  const { activeClub, clubNames } = useClub();
  const [selectedReport, setSelectedReport] = useState('financial');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errorClubs, setErrorClubs] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState(activeClub);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    includeCharts: true,
    includeDetails: true,
    customNotes: '',
    format: 'pdf' as 'pdf' | 'excel'
  });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get<UserInfo>('/reports/user-info');
        setUserInfo(response.data);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };


    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data } = await api.get<{ clubs: Club[] }>('/reports/clubs');
        setClubs(data.clubs);
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setErrorClubs('No se pudieron cargar los clubs');
      } finally {
        setLoadingClubs(false);
      }
    };
    fetchClubs();
  }, []);

  const handleExport = (format: 'excel' | 'pdf') => {
    setExportConfig(prev => ({ ...prev, format }));
    setExportOpen(true);
  };

  const handleConfirmExport = async () => {
    try {
      setLoading(true);
      const clubIds = selectedClub === 'all' ? clubs.map(c => c._id) : [selectedClub];
      const clubNames = clubIds.map(id => clubs.find(c => c._id === id)?.nombre || '').join(', ');

      await exportReport({
        reportType: selectedReport,
        format: exportConfig.format,
        period: selectedPeriod,
        dateRange,
        clubs: clubIds,
        includeCharts: exportConfig.includeCharts,
        includeDetails: exportConfig.includeDetails,
        customNotes: exportConfig.customNotes
      });

      setExportOpen(false);
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderReportContent = () => {
    const commonProps = { selectedClub, selectedPeriod, dateRange };
    switch (selectedReport) {
      case 'financial':
        return <FinancialReport {...commonProps} />;
      case 'club-performance':
        return <ClubPerformanceReport {...commonProps} />;
      case 'product-sales':
        return <ProductSalesReport {...commonProps} />;
      case 'expenses':
        return <ExpensesReport {...commonProps} />;
      case 'cash-flow':
        return <CashFlowReport {...commonProps} />;
      case 'inventory':
        return <InventoryReport {...commonProps} />;
      case 'customer-activity':
        return <CustomerActivityReport {...commonProps} />;
      case 'transaction-history':
        return <TransactionHistoryReport {...commonProps} />;
      default:
        return null;
    }
  };

  const getPeriodText = (period: string, dateRange: { start: string; end: string }) => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'week':
        // Calcular lunes de la semana actual
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        
        // Calcular domingo
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        
        return `Semana del ${formatDate(start.toISOString())} al ${formatDate(end.toISOString())}`;
      
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        return `${months[start.getMonth()]} ${start.getFullYear()}`;
      
      case 'year':
        return `Año ${now.getFullYear()}`;
      
      case 'custom':
        return `${formatDate(dateRange.start)} al ${formatDate(dateRange.end)}`;
      
      default:
        return 'Período personalizado';
    }
  };

  const getPeriodDates = (period: string) => {
    const now = new Date();
    let start, end;

    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        start = new Date(dateRange.start);
        end = new Date(dateRange.end);
        break;
      default:
        break;
    }

    return {
      start: (start ?? new Date()).toISOString().split('T')[0],
      end: (end ?? new Date()).toISOString().split('T')[0]
    };
  };

  // Agregar el modal de exportación después del componente principal
  const exportDialog = (
    <Dialog open={exportOpen} onOpenChange={setExportOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurar Exportación</DialogTitle>
          <DialogDescription>
            Personaliza los detalles del reporte a exportar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-4 border-b pb-4">
            <h4 className="font-medium">Información del Reporte</h4>
            <div className="text-sm text-muted-foreground">
              <p>Generado por: {userInfo?.nombreCompleto}</p>
              <p>Fecha: {new Date().toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</p>
              <p>Periodo: {getPeriodText(selectedPeriod, dateRange)}</p>
              <p>Club: {selectedClub === 'all' 
                ? 'Todos los clubs' 
                : clubs.find(c => c._id === selectedClub)?.nombre}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="charts"
                checked={exportConfig.includeCharts}
                onCheckedChange={(checked) => 
                  setExportConfig(prev => ({...prev, includeCharts: checked === true}))}
              />
              <Label htmlFor="charts">Incluir gráficas</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="details"
                checked={exportConfig.includeDetails}
                onCheckedChange={(checked) => 
                  setExportConfig(prev => ({...prev, includeDetails: checked === true}))}
              />
              <Label htmlFor="details">Incluir detalles completos</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Agregar notas o comentarios al reporte..."
                value={exportConfig.customNotes}
                onChange={(e) => setExportConfig(prev => ({
                  ...prev,
                  customNotes: e.target.value
                }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setExportOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmExport} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2">Exportando...</span>
                {/* Aquí podrías añadir un spinner */}
              </>
            ) : (
              `Exportar ${exportConfig.format === 'pdf' ? 'PDF' : 'Excel'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
              <FileBarChart2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Reportes
              </h1>
              <p className="text-muted-foreground">
                Análisis y métricas detalladas de tu negocio
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Club */}
            <div className="bg-card rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Club</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Selecciona un club específico o global</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={selectedClub} onValueChange={setSelectedClub} disabled={loadingClubs}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {loadingClubs
                      ? 'Cargando...'
                      : selectedClub === 'all'
                      ? 'Todos los clubs'
                      : clubs.find(c => c._id === selectedClub)?.nombre || clubNames[selectedClub]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clubs</SelectItem>
                  {!loadingClubs &&
                    clubs.map(club => (
                      <SelectItem key={club._id} value={club._id}>
                        {club.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errorClubs && <p className="text-red-500 mt-1">{errorClubs}</p>}
            </div>

            {/* Período */}
            <div className="bg-card rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Período</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Define el rango de tiempo para el análisis</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                  {selectedReport !== 'cash-flow' && (
                    <SelectItem value="custom">Personalizado</SelectItem>
                  )}
                  <SelectItem value="year">Este año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha personalizado */}
            {selectedPeriod === 'custom' && (
              <div className="col-span-2">
                <div className="bg-card rounded-xl shadow-sm border p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Fecha Inicio</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium">Fecha Fin</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full rounded-lg border bg-background px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Export */}
            <div className="bg-card rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Exportar</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Descarga el reporte en diferentes formatos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tabs de reportes */}
          <Card className="border-none shadow-xl overflow-hidden">
            <Tabs value={selectedReport} onValueChange={setSelectedReport} className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="flex flex-nowrap min-w-max bg-muted/50 p-0 rounded-t-xl">
                  {[
                    { id: 'financial', name: 'Reporte Financiero' },
                    { id: 'club-performance', name: 'Desempeño por Club' },
                    { id: 'product-sales', name: 'Ventas por Producto' },
                    { id: 'expenses', name: 'Gastos' },
                    { id: 'cash-flow', name: 'Flujo de Caja' },
                    { id: 'inventory', name: 'Inventario' },
                    { id: 'customer-activity', name: 'Actividad de Clientes' },
                    { id: 'transaction-history', name: 'Historial de Movimientos' }
                  ].map(r => (
                    <TabsTrigger 
                      key={r.id}
                      value={r.id} 
                      className="flex-1 py-3 data-[state=active]:bg-background"
                    >
                      {r.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              <div className="p-4 md:p-6">{renderReportContent()}</div>
            </Tabs>
          </Card>
        </div>
      </div>
      {exportDialog}
    </>
  );
}