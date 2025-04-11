import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from "@/services/api";

interface Props {
  employee: any | null;
}

export default function EmployeePerformance({ employee }: Props) {
  const [performance, setPerformance] = useState<{
    performanceData: any[],
    totalSales: number,
    goal: number
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setLoading(true);
    api.get(`/employees/${employee._id || employee.id}/performance`)
      .then((res) => {
        setPerformance(res.data);
      })
      .catch(err => console.error("Error al cargar el rendimiento:", err))
      .finally(() => setLoading(false));
  }, [employee]);

  if (!employee) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Rendimiento Histórico</CardTitle>
          <CardDescription className="text-gray-500">
            Selecciona un empleado para ver su rendimiento
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calcular el porcentaje de progreso
  const progressPercentage = performance ? Math.min(Math.round((performance.totalSales / performance.goal) * 100), 100) : 0;
  
  // Preparar datos para el gráfico de dona
  const prepareDonutData = () => {
    if (!performance) return [];
    
    const completed = performance.totalSales;
    const remaining = Math.max(performance.goal - performance.totalSales, 0);
    
    return [
      { name: "Completado", value: completed },
      { name: "Restante", value: remaining }
    ];
  };

  // Obtener ventas del mes actual
  const getCurrentMonthSales = () => {
    if (!performance || !performance.performanceData || performance.performanceData.length === 0) {
      return { month: "Actual", sales: 0 };
    }
    
    // Último elemento del array de datos de rendimiento
    return performance.performanceData[performance.performanceData.length - 1];
  };

  const currentMonthData = getCurrentMonthSales();
  const COLORS = ['#4f46e5', '#e5e7eb'];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Rendimiento de {employee.name || "Empleado"}</CardTitle>
            <CardDescription className="text-gray-500">
              Progreso hacia la meta y ventas actuales
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading || !performance ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Dona para Progreso de Meta */}
              <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold mb-2">Progreso hacia la Meta</h3>
                
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareDonutData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {prepareDonutData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{progressPercentage}%</span>
                    <span className="text-sm text-gray-500">completado</span>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span className="block text-sm text-gray-500">Meta</span>
                      <span className="text-lg font-bold">${performance.goal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-gray-500">Actual</span>
                      <span className="text-lg font-bold">${performance.totalSales.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Ventas del Mes Actual */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-4">Ventas del Mes Actual</h3>
                
                <div className="flex flex-col items-center justify-center h-48 bg-indigo-50 rounded-lg p-4">
                  <div className="text-gray-500 mb-2">{currentMonthData.month}</div>
                  <div className="text-4xl font-bold text-indigo-600">
                    ${currentMonthData.sales.toLocaleString()}
                  </div>
                </div>
                
              </div>
            </div>

          </>
        )}
      </CardContent>
    </Card>
  );
}