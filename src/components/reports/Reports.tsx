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

import { FinancialReport } from "./sections/FinancialReport";
import { ProductSalesReport } from "./sections/ProductSalesReport";
import { ExpensesReport } from "./sections/ExpensesReport";
import { CashFlowReport } from "./sections/CashFlowReport";
import { InventoryReport } from "./sections/InventoryReport";
import { CustomerActivityReport } from "./sections/CustomerActivityReport";
import { TransactionHistoryReport } from "./sections/TransactionHistoryReport";
import { ClubPerformanceReport } from "./sections/ClubPerformanceReport";
import api from '@/services/api';

type Club = { _id: string; nombre: string };

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [errorClubs, setErrorClubs] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

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
    // Lógica de exportación, por ejemplo llamar a /reports/export
    console.log(`Exportando en formato ${format}`);
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

  return (
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
                <SelectValue placeholder="Selecciona un club">
                  {loadingClubs
                    ? 'Cargando...'
                    : selectedClub === 'all'
                    ? 'Todos los clubs'
                    : clubs.find(c => c._id === selectedClub)?.nombre}
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
                  { id: 'financial', name: 'Financiero' },
                  { id: 'club-performance', name: 'Desempeño por Club' },
                  { id: 'product-sales', name: 'Ventas por Producto' },
                  { id: 'expenses', name: 'Gastos' },
                  { id: 'cash-flow', name: 'Flujo de Caja' },
                  { id: 'inventory', name: 'Inventario' },
                  { id: 'customer-activity', name: 'Actividad de Clientes' },
                  { id: 'transaction-history', name: 'Historial de Movimientos' },
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
  );
}