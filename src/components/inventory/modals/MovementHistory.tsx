// src/components/modals/MovementHistoryModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, CalendarIcon, ChevronLeft, ChevronRight, User } from "lucide-react";
import api from "@/services/api";
import { getMovementIcon } from "../utils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DateRange, DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"; // Corrección: importar desde la carpeta de componentes UI
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"; // Corrección: importar desde la carpeta de componentes UI
import { es } from "date-fns/locale";

interface Movement {
  id: string;
  date: string;
  type: string;
  quantity: number;
  user: { nombre?: string } | string;
  description: string;
}

interface MovementHistoryModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export function MovementHistoryModal({
  open,
  onClose,
  productId,
  productName,
}: MovementHistoryModalProps) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<"week" | "month" | "year" | "custom">("week");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const itemsPerPage = 10;

  const getDateRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    
    switch (dateFilter) {
      case "week":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return {
          from: startOfWeek,
          to: new Date()
        };
      case "month":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return {
          from: startOfMonth,
          to: new Date()
        };
      case "year":
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        return {
          from: startOfYear,
          to: new Date()
        };
      case "custom":
        return dateRange;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (open && productId) {
      const fetchMovements = async () => {
        setLoading(true);
        try {
          const range = getDateRange();
          const params = range ? {
            from: range.from ? format(range.from, "yyyy-MM-dd") : undefined, // Corrección: agregar verificación para from
            to: range.to ? format(range.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
          } : {};

          const response = await api.get(`/inventory/movements/${productId}`, { params });
          const sortedMovements = response.data.sort((a: Movement, b: Movement) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setMovements(sortedMovements);
        } catch (error) {
          console.error("Error al cargar el historial de movimientos:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar el historial de movimientos.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchMovements();
    }
  }, [open, productId, dateFilter, dateRange]);

  const totalPages = Math.ceil(movements.length / itemsPerPage);

  // Obtener los movimientos de la página actual
  const getCurrentPageMovements = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return movements.slice(startIndex, endIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-lg md:text-xl">Historial de Movimientos</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {productName} - Últimos movimientos registrados
          </DialogDescription>
          
          {/* Filtros de fecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select 
              value={dateFilter} 
              onValueChange={(value: "week" | "month" | "year" | "custom") => {
                setDateFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Semana actual</SelectItem>
                <SelectItem value="month">Mes actual</SelectItem>
                <SelectItem value="year">Año actual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                          {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayPicker
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </DialogHeader>
        
        {/* Contenido de la tabla */}
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Fecha</TableHead>
                      <TableHead className="whitespace-nowrap">Tipo</TableHead>
                      <TableHead className="whitespace-nowrap">Cantidad</TableHead>
                      <TableHead className="whitespace-nowrap hidden sm:table-cell">Usuario</TableHead>
                      <TableHead className="whitespace-nowrap hidden md:table-cell">Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentPageMovements().length > 0 ? (
                      getCurrentPageMovements().map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(movement.date), "dd/MM/yyyy HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {getMovementIcon(movement.type as "entrada" | "salida" | "ajuste")}
                              <span className="capitalize">{movement.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{movement.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap hidden sm:table-cell">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {typeof movement.user === "string"
                                ? movement.user
                                : movement.user?.nombre || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                            {movement.description}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No hay movimientos para mostrar
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {getCurrentPageMovements().length > 0 && (
                <div className="flex items-center justify-between px-2 py-4 border-t">
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages || 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

