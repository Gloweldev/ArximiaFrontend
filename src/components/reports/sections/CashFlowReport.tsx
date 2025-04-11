import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

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
}

// Mock data
const cashFlowData: CashFlowDay[] = [
  { date: '2024-05-01', inflow: 500, outflow: 200, balance: 300 },
  { date: '2024-05-02', inflow: 300, outflow: 150, balance: 150 },
  { date: '2024-05-03', inflow: 400, outflow: 100, balance: 300 },
  { date: '2024-05-04', inflow: 200, outflow: 50, balance: 150 },
  { date: '2024-05-05', inflow: 0, outflow: 300, balance: -300 },
  { date: '2024-05-06', inflow: 600, outflow: 200, balance: 400 },
  { date: '2024-05-07', inflow: 350, outflow: 150, balance: 200 },
  { date: '2024-05-08', inflow: 450, outflow: 250, balance: 200 },
  { date: '2024-05-09', inflow: 300, outflow: 100, balance: 200 },
  { date: '2024-05-10', inflow: 200, outflow: 400, balance: -200 },
  { date: '2024-05-11', inflow: 500, outflow: 100, balance: 400 },
  { date: '2024-05-12', inflow: 300, outflow: 200, balance: 100 },
  { date: '2024-05-13', inflow: 400, outflow: 300, balance: 100 },
  { date: '2024-05-14', inflow: 600, outflow: 200, balance: 400 },
  { date: '2024-05-15', inflow: 800, outflow: 500, balance: 300 },
  { date: '2024-05-16', inflow: 400, outflow: 200, balance: 200 },
  { date: '2024-05-17', inflow: 300, outflow: 100, balance: 200 },
  { date: '2024-05-18', inflow: 200, outflow: 300, balance: -100 },
  { date: '2024-05-19', inflow: 500, outflow: 200, balance: 300 },
  { date: '2024-05-20', inflow: 400, outflow: 100, balance: 300 },
  { date: '2024-05-21', inflow: 300, outflow: 200, balance: 100 },
  { date: '2024-05-22', inflow: 200, outflow: 400, balance: -200 },
  { date: '2024-05-23', inflow: 600, outflow: 300, balance: 300 },
  { date: '2024-05-24', inflow: 400, outflow: 200, balance: 200 },
  { date: '2024-05-25', inflow: 300, outflow: 100, balance: 200 },
  { date: '2024-05-26', inflow: 200, outflow: 50, balance: 150 },
  { date: '2024-05-27', inflow: 500, outflow: 300, balance: 200 },
  { date: '2024-05-28', inflow: 400, outflow: 200, balance: 200 },
  { date: '2024-05-29', inflow: 300, outflow: 100, balance: 200 },
  { date: '2024-05-30', inflow: 200, outflow: 400, balance: -200 },
  { date: '2024-05-31', inflow: 700, outflow: 300, balance: 400 },
];

export function CashFlowReport({  }: Props) {
  const [currentMonth, setCurrentMonth] = useState('Mayo 2024');
  const [selectedDay, setSelectedDay] = useState<CashFlowDay | null>(null);

  // Calcular totales
  const totalInflow = cashFlowData.reduce((sum, day) => sum + day.inflow, 0);
  const totalOutflow = cashFlowData.reduce((sum, day) => sum + day.outflow, 0);
  const netCashFlow = totalInflow - totalOutflow;

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

  // Agrupar los días por semanas
  const weeks: CashFlowDay[][] = [];
  let currentWeek: CashFlowDay[] = [];

  // Encontrar el primer día del mes
  const firstDay = new Date(cashFlowData[0].date);
  const firstDayOfWeek = getDayOfWeek(cashFlowData[0].date);

  // Rellenar los días anteriores al primer día del mes
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
  }

  // Agregar todos los días del mes
  cashFlowData.forEach((day) => {
    currentWeek.push(day);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Rellenar los días restantes de la última semana
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">{currentMonth}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
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
                <span className="text-sm text-green-500">+12% vs mes anterior</span>
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
                <span className="text-sm text-red-500">-5% vs mes anterior</span>
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
                      className="p-2 bg-background"
                    />
                  );
                }

                const date = new Date(day.date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    className={`p-2 bg-background hover:bg-muted/50 cursor-pointer transition-colors ${
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
                          {date.getDate()}
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
      {selectedDay && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {new Date(selectedDay.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <Badge
              variant={selectedDay.balance >= 0 ? "default" : "destructive"}
              className={
                selectedDay.balance >= 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              Balance: ${selectedDay.balance}
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
                  <div className="text-sm text-muted-foreground">3 transacciones</div>
                </div>
              </div>
              <div className="text-xl font-bold text-green-600">
                +${selectedDay.inflow}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium">Salidas</div>
                  <div className="text-sm text-muted-foreground">2 transacciones</div>
                </div>
              </div>
              <div className="text-xl font-bold text-red-600">
                -${selectedDay.outflow}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}