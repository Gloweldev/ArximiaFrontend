import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ShoppingBag,
  Building2,
  Zap,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { ExpenseDetailsModal } from "./modals/ExpenseDetails";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useClub } from "@/context/ClubContext";

const categoryIcons = {
  purchases: { icon: ShoppingBag, color: "text-blue-500" },
  rent: { icon: Building2, color: "text-purple-500" },
  services: { icon: Zap, color: "text-yellow-500" },
};

const categoryNames = {
  purchases: "Compras",
  rent: "Renta",
  services: "Servicios",
};

interface ExpensesListProps {
  refresh: number;
  dateRange: { start: string; end: string };
  searchTerm?: string;
  selectedCategory?: string;
}

export function ExpensesList({
  refresh,
  dateRange,
  searchTerm = "",
  selectedCategory = "all",
}: ExpensesListProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();
  const { activeClub } = useClub();

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!activeClub) return;

        // Armamos los parámetros de consulta usando el rango de fechas y otros filtros
        const params: any = {
          clubId: activeClub,
          start: dateRange.start,
          end: dateRange.end,
        };

        if (searchTerm.trim()) {
          params.search = searchTerm;
        }

        if (selectedCategory && selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        const res = await api.get("/expenses", { params });
        setExpenses(res.data);
        // Reiniciamos la página a 1 cuando cambien los filtros
        setCurrentPage(1);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la lista de gastos",
          variant: "destructive",
        });
      }
    };

    fetchExpenses();
  }, [activeClub, toast, refresh, dateRange, searchTerm, selectedCategory]);

  const handleViewDetails = (expense: any) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  // Cálculo de la paginación
  const indexOfLastExpense = currentPage * itemsPerPage;
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  const currentExpenses = expenses.slice(indexOfFirstExpense, indexOfLastExpense);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExpenses.map((expense) => {
              const categoryKey = expense.category;
              const CategoryIcon =
                categoryIcons[categoryKey as keyof typeof categoryIcons]?.icon ||
                ShoppingBag;
              const categoryColor =
                categoryIcons[categoryKey as keyof typeof categoryIcons]?.color ||
                "text-blue-500";

              return (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.date), "d 'de' MMMM, HH:mm", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CategoryIcon className={`h-4 w-4 ${categoryColor}`} />
                      <span>
                        {categoryNames[categoryKey as keyof typeof categoryNames] ||
                          expense.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(expense)}>
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Siguiente
        </Button>
      </div>

      <ExpenseDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        expense={selectedExpense}
      />
    </>
  );
}


