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
import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek } from "date-fns";
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
import { addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const itemsPerPage = 10;

  const getDateRange = () => {
    const now = currentDate;
    
    switch (dateFilter) {
      case "week": {
        const start = startOfWeek(now, { weekStartsOn: 1 });
        const end = endOfWeek(now, { weekStartsOn: 1 });
        return { from: start, to: end };
      }
      case "month": {
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        return { from: start, to: end };
      }
      case "year": {
        const start = startOfYear(now);
        const end = endOfYear(now);
        return { from: start, to: end };
      }
      case "custom":
        return dateRange || { from: subDays(now, 7), to: now };
      default:
        return { from: subDays(now, 7), to: now };
    }
  };

  const formatDateSafely = (date: Date | undefined) => {
    return date ? format(date, "dd/MM/yy") : "";
  };

  const getFormattedDateRange = () => {
    const range = getDateRange();
    if (!range.from || !range.to) return {};
    
    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    
    const toDate = new Date(range.to);
    toDate.setHours(23, 59, 59, 999);
    
    return {
      from: fromDate.toISOString(),
      to: toDate.toISOString()
    };
  };

  useEffect(() => {
    if (open && productId) {
      const fetchMovements = async () => {
        setLoading(true);
        try {
          const dateParams = getFormattedDateRange();
          console.log('Fetching with dates:', dateParams); // Para debug
          
          const response = await api.get(`/inventory/movements/${productId}`, {
            params: dateParams
          });

          const sortedMovements = response.data.sort((a: Movement, b: Movement) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setMovements(sortedMovements);
          setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
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
  }, [open, productId, dateFilter, dateRange, currentDate]);

  const totalPages = Math.ceil(movements.length / itemsPerPage);

  // Obtener los movimientos de la página actual
  const getCurrentPageMovements = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return movements.slice(startIndex, endIndex);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(current => {
      switch (dateFilter) {
        case 'week':
          return direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1);
        case 'month':
          return direction === 'next' ? addMonths(current, 1) : subMonths(current, 1);
        case 'year':
          return direction === 'next' ? addYears(current, 1) : subYears(current, 1);
        default:
          return current;
      }
    });
  };

  const getDateRangeDisplay = () => {
    const range = getDateRange();
    switch (dateFilter) {
      case 'week':
        if (!range.from || !range.to) return '';
        return `Semana del ${format(range.from, 'dd/MM/yyyy')} al ${format(range.to, 'dd/MM/yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: es });
      case 'year':
        return format(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-lg md:text-xl">Historial de Movimientos</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {productName} - Últimos movimientos registrados
          </DialogDescription>
          
          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              value={dateFilter} 
              onValueChange={(value: "week" | "month" | "year" | "custom") => {
                setDateFilter(value);
                setCurrentDate(new Date()); // Reset a fecha actual al cambiar filtro
                setCurrentPage(1);
                if (value !== "custom") {
                  setDateRange(undefined);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter !== 'custom' ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center font-medium">
                  {getDateRangeDisplay()}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {formatDateSafely(dateRange.from)} -{" "}
                          {formatDateSafely(dateRange.to)}
                        </>
                      ) : (
                        formatDateSafely(dateRange.from)
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <div className="p-3 border-b">
                    <DayPicker
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      locale={es}
                      showOutsideDays
                      className="border-0"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium",
                        nav: "space-x-1 flex items-center",
                        nav_button: cn(
                          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                        ),
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                        ),
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                    />
                  </div>
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

