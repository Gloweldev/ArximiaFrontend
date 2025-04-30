import React from "react";
import { useEffect, useState, } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, Coffee, User, Calendar, Search, DollarSign, ChevronLeft, ChevronRight, History } from "lucide-react";
import  api  from "@/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/components/inventory/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface Movimiento {
  _id: string;
  fecha: string;
  tipo: 'venta' | 'gasto';
  descripcion: string;
  monto: number;
  itemGroups?: Array<{
    name: string;
    items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;
    subtotal: number;
  }>;
  responsable: {
    nombre: string;
    _id: string;
  };
  estado: string;
}

interface MovimientoResponse {
  movimientos: Movimiento[];
  paginacion: {
    total: number;
    totalPaginas: number;
    paginaActual: number;
    porPagina: number;
  };
}

export function TransactionHistoryReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MovimientoResponse | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [montoMin, setMontoMin] = useState<string>("");
  const [montoMax, setMontoMax] = useState<string>("");
  const [responsable, setResponsable] = useState<string>("");
  const [estado, setEstado] = useState<string>("todos");
  const [expandedMovimiento, setExpandedMovimiento] = useState<string | null>(null);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const params = {
        clubId: selectedClub,
        period: selectedPeriod,
        startDate: dateRange.start,
        endDate: dateRange.end,
        page: paginaActual,
        limit: 10,
        tipo: tipoMovimiento !== 'todos' ? tipoMovimiento : undefined,
        busqueda: busqueda || undefined,
        responsable: responsable || undefined,
        montoMin: montoMin ? parseFloat(montoMin) : undefined,
        montoMax: montoMax ? parseFloat(montoMax) : undefined,
        estado: estado !== 'todos' ? estado : undefined
      };

      const response = await api.get<MovimientoResponse>('/reports/transactions', { params });
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error obteniendo movimientos:', err);
      setError(err.response?.data?.message || 'Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  };

  // Usar useEffect para aplicar los filtros con debounce
  useEffect(() => {
    const timeoutId = setTimeout(fetchMovimientos, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedClub, selectedPeriod, dateRange, paginaActual, tipoMovimiento, busqueda, responsable, montoMin, montoMax, estado]);

  const toggleExpand = (movimientoId: string) => {
    setExpandedMovimiento(current => current === movimientoId ? null : movimientoId);
  };

  return (
    <div className="space-y-6">
      {/* Descripción de la sección */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start gap-3">
          <History className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h3 className="font-medium mb-1">Historial de Movimientos</h3>
            <p className="text-sm text-muted-foreground">
              Accede al registro completo de todas las transacciones realizadas. Filtra y analiza
              movimientos por tipo, fecha, monto y responsable para mantener un control detallado
              de la operación del negocio.
            </p>
          </div>
        </div>
      </Card>

      {/* Filtros con diseño responsive mejorado */}
      <Card className="p-4 md:p-6">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Primera fila de filtros */}
          <div className="space-y-2">
            <Label>Búsqueda</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Movimiento</Label>
            <Select value={tipoMovimiento} onValueChange={setTipoMovimiento}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de movimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los movimientos</SelectItem>
                <SelectItem value="venta">Ventas</SelectItem>
                <SelectItem value="gasto">Gastos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Responsable</Label>
            <Input
              placeholder="Buscar por responsable..."
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Segunda fila para rango de montos */}
        <div className="space-y-2">
          <Label>Rango de Montos</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Monto mínimo"
                value={montoMin}
                onChange={(e) => setMontoMin(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Monto máximo"
                value={montoMax}
                onChange={(e) => setMontoMax(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {/* Añadir mensaje de resultados de búsqueda */}
        {busqueda && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            {data?.movimientos && data.movimientos.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                Mostrando resultados para "<span className="font-medium text-foreground">{busqueda}</span>"
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se encontraron resultados para "<span className="font-medium text-foreground">{busqueda}</span>"
              </p>
            )}
          </div>
        )}

        <div className="overflow-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Fecha</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[150px]">Responsable</TableHead>
                  <TableHead className="text-right w-[120px]">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.movimientos.map((movimiento) => (
                  <React.Fragment key={movimiento._id}>
                    <TableRow 
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        movimiento.tipo === 'venta' && "group",
                        expandedMovimiento === movimiento._id && "bg-muted/30"
                      )}
                      onClick={() => movimiento.tipo === 'venta' && toggleExpand(movimiento._id)}
                    >
                      <TableCell>
                        {new Date(movimiento.fecha).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={movimiento.tipo === 'venta' ? 'default' : 'destructive'}
                          className={
                            movimiento.tipo === 'venta'
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {movimiento.tipo === 'venta' ? 'Venta' : 'Gasto'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movimiento.tipo === 'venta' ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-sm">
                              {movimiento.itemGroups?.map(group => {
                                const productNames = group.items.map(item => item.name).join(', ');
                                return `${group.name} - ${productNames}`;
                              }).join(' | ')}
                            </span>
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              Click para ver más detalles →
                            </span>
                          </div>
                        ) : (
                          movimiento.descripcion
                        )}
                      </TableCell>
                      <TableCell>{movimiento.responsable.nombre}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        <span className={movimiento.tipo === 'venta' ? 'text-green-600' : 'text-red-600'}>
                          {movimiento.tipo === 'venta' ? '+' : '-'}${Math.abs(movimiento.monto).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Detalles expandibles - mantener el código existente */}
                    {movimiento.tipo === 'venta' && expandedMovimiento === movimiento._id && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0 border-t-0">
                          <div className="p-4 space-y-4 bg-muted/5">
                            {movimiento.itemGroups?.map((group, groupIndex) => (
                              <div key={groupIndex} className="rounded-lg bg-background border p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-base font-semibold text-primary">
                                    {group.name}
                                  </h4>
                                  <span className="text-sm font-medium tabular-nums">
                                    Subtotal: ${group.subtotal.toLocaleString()}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {group.items.map((item, itemIndex) => (
                                    <div 
                                      key={itemIndex}
                                      className="grid grid-cols-4 items-center text-sm py-2 border-b last:border-0"
                                    >
                                      <span className="col-span-2 font-medium">{item.name}</span>
                                      <span className="text-muted-foreground tabular-nums">
                                        {item.quantity} × ${item.unit_price.toLocaleString()}
                                      </span>
                                      <span className="text-right tabular-nums">
                                        ${item.subtotal.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-end">
                              <span className="text-sm text-muted-foreground tabular-nums">
                                Total de la venta: ${movimiento.monto.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}

                {/* Mostrar mensaje cuando no hay resultados */}
                {data?.movimientos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No se encontraron movimientos</p>
                        {busqueda && (
                          <p className="text-sm">
                            Intenta con otros términos de búsqueda
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Ajuste en la paginación para móviles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {((data?.paginacion.paginaActual || 1) - 1) * 10 + 1} a{" "}
            {Math.min((data?.paginacion.paginaActual || 1) * 10, data?.paginacion.total || 0)} de{" "}
            {data?.paginacion.total || 0} movimientos
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {paginaActual} de {data?.paginacion.totalPaginas || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual(p => Math.min(data?.paginacion.totalPaginas || 1, p + 1))}
              disabled={paginaActual === (data?.paginacion.totalPaginas || 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}