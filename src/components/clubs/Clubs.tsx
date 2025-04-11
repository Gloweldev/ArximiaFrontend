// Clubs.tsx
import { useState, useEffect } from "react";
import {
  Store,
  Plus,
  Search,
  Edit,
  Settings,
  Trash2,
  Users,
  DollarSign,
  FileSpreadsheet,
  File as FilePdf,
  ArrowUpDown,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NewClubModal } from "./modals/NewClub";
import { EditClubModal } from "./modals/EditClub";
import { ClubCard } from "./ClubCard";
import { ViewSelector } from "./ViewSelector";
import { Club } from "./types";
import api from "@/services/api"; // Ajusta el path a donde tengas tu servicio axios

export default function Clubs() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [salesFilter, setSalesFilter] = useState<number | "">("");
  const [showNewClubModal, setShowNewClubModal] = useState(false);
  const [showEditClubModal, setShowEditClubModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    field: "name" | "sales" | "expenses" | "employees";
    order: "asc" | "desc";
  }>({ field: "name", order: "asc" });

  const refreshClubs = async () => {
    try {
      const clubsResponse = await api.get<Club[]>("/clubs");
      const clubsFromApi = clubsResponse.data;

      const clubsConResumen = await Promise.all(
        clubsFromApi.map(async (club) => {
          try {
            const summaryResponse = await api.get(`/clubs/${club.id}/summary`);
            const summary = summaryResponse.data;
            return {
              ...club,
              monthlyStats: {
                sales: summary.totalSales,
                expenses: summary.totalExpenses,
                salesGoal: club.monthlyStats?.salesGoal || 10000,
              },
            };
          } catch (error) {
            console.error(`Error al obtener resumen para club ${club.id}:`, error);
            return club;
          }
        })
      );

      setClubs(clubsConResumen);
    } catch (error) {
      console.error("Error al cargar clubs:", error);
    }
  };

  // Función para cargar los clubs y sus resúmenes usando axios
  useEffect(() => {
    async function fetchClubs() {
      try {
        // Consulta la lista de clubs desde el endpoint /api/club
        const clubsResponse = await api.get<Club[]>("/clubs");
        const clubsFromApi = clubsResponse.data;

        // Para cada club, se consulta su resumen (ventas y gastos) desde /api/club/{id}/summary
        const clubsConResumen = await Promise.all(
          clubsFromApi.map(async (club) => {
            try {
              const summaryResponse = await api.get(`/clubs/${club.id}/summary`);
              const summary = summaryResponse.data;
              return {
                ...club,
                monthlyStats: {
                  sales: summary.totalSales,
                  expenses: summary.totalExpenses,
                  // Si en el objeto original viene la meta de ventas, la preservamos; de lo contrario se asigna un valor por defecto.
                  salesGoal: club.monthlyStats?.salesGoal || 10000,
                },
              };
            } catch (error) {
              console.error(`Error al obtener resumen para club ${club.id}:`, error);
              // Si falla la obtención del resumen, se retorna el club sin modificar monthlyStats
              return club;
            }
          })
        );

        setClubs(clubsConResumen);
      } catch (error) {
        console.error("Error al cargar clubs:", error);
      }
    }

    fetchClubs();
  }, []);

  const handleSort = (field: "name" | "sales" | "expenses" | "employees") => {
    setSortConfig({
      field,
      order:
        sortConfig.field === field && sortConfig.order === "asc"
          ? "desc"
          : "asc",
    });
  };

  const filteredClubs = clubs
    .filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || club.status === statusFilter;
      const matchesSales =
        !salesFilter || club.monthlyStats.sales >= Number(salesFilter);
      return matchesSearch && matchesStatus && matchesSales;
    })
    .sort((a, b) => {
      const order = sortConfig.order === "asc" ? 1 : -1;
      switch (sortConfig.field) {
        case "name":
          return order * a.name.localeCompare(b.name);
        case "sales":
          return order * (a.monthlyStats.sales - b.monthlyStats.sales);
        case "expenses":
          return order * (a.monthlyStats.expenses - b.monthlyStats.expenses);
        case "employees":
          return order * (a.employeesCount - b.employeesCount);
        default:
          return 0;
      }
    });

  const handleEditClub = (club: Club) => {
    setSelectedClub(club);
    setShowEditClubModal(true);
  };

  const handleDeleteClub = (club: Club) => {
    setSelectedClub(club);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // Implementa la lógica de eliminación aquí, por ejemplo, una petición DELETE a la API
    setShowDeleteDialog(false);
    setSelectedClub(null);
  };

  const handleExport = (format: "excel" | "pdf") => {
    console.log(`Exportando en formato ${format}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Mis Clubs
                </h1>
                <p className="text-muted-foreground">
                  Gestiona y monitorea todos tus clubs
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewClubModal(true)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Club
            </button>
          </div>

          {/* Filtros y controles */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <Input
                type="number"
                placeholder="Ventas mínimas"
                value={salesFilter}
                onChange={(e) =>
                  setSalesFilter(e.target.value ? Number(e.target.value) : "")
                }
                className="w-[150px]"
              />

              <ViewSelector view={viewMode} onChange={setViewMode} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FilePdf className="h-4 w-4 mr-2" />
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onEdit={handleEditClub}
                onDelete={handleDeleteClub}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="hover:bg-transparent"
                    >
                      Club
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("sales")}
                      className="hover:bg-transparent"
                    >
                      Ventas
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("expenses")}
                      className="hover:bg-transparent"
                    >
                      Gastos
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("employees")}
                      className="hover:bg-transparent"
                    >
                      Empleados
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell className="text-right">Acciones</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <div className="font-medium">{club.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 inline-block mr-1" />
                        {club.contact.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        {club.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${club.monthlyStats.sales.toLocaleString()}
                      </div>
                      <Progress
                        value={
                          (club.monthlyStats.sales / club.monthlyStats.salesGoal) *
                          100
                        }
                        className="h-1 w-20"
                      />
                    </TableCell>
                    <TableCell>
                      ${club.monthlyStats.expenses.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        {club.employeesCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={club.status === "active" ? "default" : "secondary"}
                        className={
                          club.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {club.status === "active" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {club.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClub(club)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClub(club)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        <NewClubModal open={showNewClubModal} onOpenChange={setShowNewClubModal} onSuccess={refreshClubs}/>

        <EditClubModal
          open={showEditClubModal}
          onOpenChange={setShowEditClubModal}
          club={selectedClub}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Eliminar Club
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar este club? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

