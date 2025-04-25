import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";
import  api  from "@/services/api";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface CashFlowDay {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
  inflowCount: number;
  outflowCount: number;
  hasData: boolean;
}

interface CashFlowData {
  cashFlowData: CashFlowDay[];
  summary: {
    totalInflow: number;
    totalOutflow: number;
    netCashFlow: number;
    inflowChange: number;
    outflowChange: number;
  };
}

export function CashFlowReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CashFlowData | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // Si hay un periodo seleccionado, usar esa fecha
    if (selectedPeriod === 'custom' && dateRange.start) {
      return new Date(dateRange.start);
    }
    return now;
  });
  const [selectedDay, setSelectedDay] = useState<CashFlowDay | null>(null);

  const getWeekRange = (date: Date) => {
    const current = new Date(date);
    current.setHours(0, 0, 0, 0);
    
    const currentDay = current.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday,
      end: sunday
    };
  };

  const formatWeekHeader = () => {
    if (selectedPeriod !== 'week') {
      return currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    const weekRange = getWeekRange(currentDate);
    const startDate = weekRange.start.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'long'
    });
    const endDate = weekRange.end.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });

    return `Semana del ${startDate} al ${endDate}`;
  };

  useEffect(() => {
    const fetchCashFlowData = async () => {
      try {
        setLoading(true);
        const params: { clubId: string; month: number; year: number; period: string; date: string; startDate?: string; endDate?: string } = {
          clubId: selectedClub,
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          period: selectedPeriod,
          date: currentDate.toISOString() // Añadir la fecha actual para calcular la semana correcta
        };

        if (selectedPeriod === 'week') {
          const weekRange = getWeekRange(currentDate);
          params.startDate = weekRange.start.toISOString();
          params.endDate = weekRange.end.toISOString();
        }

        const response = await api.get<CashFlowData>('/reports/cashflow', { params });
        setData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching cash flow data:', err);
        setError(err.response?.data?.message || 'Error al cargar los datos de flujo de caja');
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, [selectedClub, selectedPeriod, currentDate]);

  useEffect(() => {
    // Actualizar la fecha actual cuando cambie el periodo o el rango de fechas
    if (selectedPeriod === 'custom' && dateRange.start) {
      setCurrentDate(new Date(dateRange.start));
    }
  }, [selectedPeriod, dateRange]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (selectedPeriod === 'week') {
        newDate.setDate(prev.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        newDate.setMonth(prev.getMonth() - 1);
      } else if (selectedPeriod === 'year') {
        newDate.setMonth(prev.getMonth() - 1);
      }
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (selectedPeriod === 'week') {
        newDate.setDate(prev.getDate() + 7);
      } else if (selectedPeriod === 'month') {
        newDate.setMonth(prev.getMonth() + 1);
      } else if (selectedPeriod === 'year') {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const adjustToLocalTimezone = (dateString: string) => {
    const date = new Date(dateString);
    // Ajustar a la zona horaria local (México UTC-6)
    date.setHours(date.getHours() + 6);
    return date;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Cargando...</div>;
  }

  if (error || !data) {
    return <div className="flex items-center justify-center h-96 text-red-500">{error}</div>;
  }

  // Calcular totales
  const totalInflow = data.summary.totalInflow;
  const totalOutflow = data.summary.totalOutflow;
  const netCashFlow = data.summary.netCashFlow;

  // Calcular saldo actual y proyección
  const currentBalance = 5000; // Saldo actual (ejemplo)
  const next7DaysOutflow = 1200; // Salidas estimadas próximos 7 días (ejemplo)

  // Generar días del calendario
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Función para obtener el día de la semana (0-6, donde 0 es lunes)
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return (date.getDay() + 6) % 7; // Convertir 0=domingo a 0=lunes
  };

  const generateCalendarData = () => {
    if (!data?.cashFlowData) return [];
    
    if (selectedPeriod === 'week') {
      // Para vista semanal, solo mostrar los 7 días de la semana actual
      return [data.cashFlowData];
    } else {
      // Para vista mensual, mantener la lógica actual de semanas
      const weeks: CashFlowDay[][] = [];
      let currentWeek: CashFlowDay[] = [];
      
      // Encontrar el primer día del mes
      const firstDay = new Date(data.cashFlowData[0].date);
      const firstDayOfWeek = getDayOfWeek(data.cashFlowData[0].date);
      
      // Rellenar días anteriores al primer día del mes
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0, inflowCount: 0, outflowCount: 0, hasData: false });
      }
      
      // Agregar los días del mes
      data.cashFlowData.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });
      
      // Rellenar días restantes de la última semana
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0, inflowCount: 0, outflowCount: 0, hasData: false });
        }
        weeks.push(currentWeek);
      }
      
      return weeks;
    }
  };

  const weeks = generateCalendarData();

  const renderSelectedDayDetails = () => {
    if (!selectedDay) return null;
  
    const localDate = adjustToLocalTimezone(selectedDay.date);
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {localDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <Badge
            variant={selectedDay.balance >= 0 ? "default" : "destructive"}
            className={selectedDay.balance >= 0 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"}
          >
            Balance: ${selectedDay.balance.toLocaleString()}
          </Badge>
        </div>
  
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Entradas</div>
                <div className="text-sm text-muted-foreground">
                  {selectedDay.inflowCount} transacciones
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              +${selectedDay.inflow.toLocaleString()}
            </div>
          </div>
  
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium">Salidas</div>
                <div className="text-sm text-muted-foreground">
                  {selectedDay.outflowCount} transacciones
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-red-600">
              -${selectedDay.outflow.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">
            {formatWeekHeader()}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousMonth}
            disabled={selectedPeriod === 'month'}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
            disabled={selectedPeriod === 'month'}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Inflows Card */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Entradas
              </h3>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${totalInflow.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">+{data.summary.inflowChange}% vs mes anterior</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Outflows Card */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 border-red-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Salidas
              </h3>
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalOutflow.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">-{data.summary.outflowChange}% vs mes anterior</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Net Flow Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Flujo Neto
              </h3>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${netCashFlow.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-500">+8% vs mes anterior</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
          {/* Days of Week Headers */}
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium bg-muted"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((day, dayIndex) => {
                if (!day.date) {
                  return (
                    <div
                      key={`empty-${dayIndex}`}
                      className="p-2 bg-background min-h-[100px]"
                    />
                  );
                }

                const localDate = adjustToLocalTimezone(day.date);
                const isToday = localDate.toDateString() === new Date().toDateString();
                const isSelected = selectedDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    className={`p-2 bg-background hover:bg-muted/50 cursor-pointer transition-colors min-h-[100px] ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-primary' : ''
                          }`}
                        >
                          {localDate.getDate()}
                        </span>
                        {isToday && (
                          <Badge variant="secondary" className="text-[10px] px-1">
                            Hoy
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 mt-auto">
                        {day.inflow > 0 && (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <ArrowUpRight className="h-3 w-3" />
                            ${day.inflow}
                          </div>
                        )}
                        {day.outflow > 0 && (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <ArrowDownRight className="h-3 w-3" />
                            ${day.outflow}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Selected Day Details */}
      {renderSelectedDayDetails()}
    </div>
  );
}