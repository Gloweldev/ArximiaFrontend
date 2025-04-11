import { useState, useEffect } from "react";
import { Users2, Plus, Search, FileSpreadsheet, File as FilePdf, TrendingUp, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeesList } from "./EmployeesList";
import { NewEmployeeModal } from "./modals/NewEmployee";
import { RolesModal } from "./modals/RolesModal";
import EmployeePerformance from "./EmployeePerformance";
import api from "@/services/api"; // Ajusta la ruta a tu configuración de Axios

export default function Employees() {
  // Estados para modales y filtros
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  // En la sección de estados del componente Employees
  const [stores, setStores] = useState<{_id: string, nombre: string}[]>([]);

  // Estado para la lista de empleados (datos reales)
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Estado para los KPIs
  const [kpiData, setKpiData] = useState<{
    topSeller: { name: string; salesAmount: number };
    lastSaleEmployee: { name: string };
  } | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Obtención de empleados desde el endpoint
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        // Se espera que el endpoint devuelva los empleados en response.data.employees
        setEmployees(response.data.employees);
      } catch (error) {
        console.error("Error al cargar los empleados:", error);
      }
      setLoadingEmployees(false);
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/employees/clubs');
        setStores(response.data.clubs);
      } catch (error) {
        console.error("Error al cargar las tiendas:", error);
      }
    };
  
    fetchStores();
  }, []);

  // Obtención de KPIs desde el endpoint
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const response = await api.get('/employees/sales');
        setKpiData(response.data);
      } catch (error) {
        console.error("Error al cargar los KPIs:", error);
      }
      setKpiLoading(false);
    };

    fetchKPI();
  }, []);

  const handleExport = (format: 'excel' | 'pdf') => {
    console.log(`Exportando en formato ${format}`);
  };

  // Se filtran los empleados según los filtros aplicados y el término de búsqueda
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || employee.role.toLowerCase() === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" ? employee.status === "Activo" : employee.status === "Pendiente");
    const matchesStore = storeFilter === "all" || employee.club?._id === storeFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesStore;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Empleados
                </h1>
                <p className="text-muted-foreground">
                  Gestiona tu equipo y sus roles
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRolesModal(true)}
              >
                Gestionar Roles
              </Button>
              <button
                onClick={() => setShowNewEmployeeModal(true)}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Empleado
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Empleados Activos */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Empleados Activos
                  </h3>
                  <Users2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {employees.filter(e => e.status === "active").length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    de {employees.length} totales
                  </p>
                </div>
              </div>
            </Card>

            {/* Empleado con más ventas */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border-green-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Empleado con más ventas
                  </h3>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  {kpiLoading ? (
                    <div className="text-2xl font-bold text-green-600">Cargando...</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {kpiData?.topSeller.name || "N/A"}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${kpiData?.topSeller.salesAmount.toLocaleString() || "0"} en ventas
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* Último empleado que realizó una venta */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10 border-blue-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Último empleado en vender
                  </h3>
                  <Award className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  {kpiLoading ? (
                    <div className="text-2xl font-bold text-blue-600">Cargando...</div>
                  ) : (
                    <div className="text-2xl font-bold text-blue-600">
                      {kpiData?.lastSaleEmployee.name || "N/A"}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Realizó la última venta
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Controles */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="all">Todos los roles</option>
                <option value="cajero">Cajeros</option>
                <option value="preparador">Preparadores</option>
                <option value="supervisor">Supervisores</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="all">Todas las tiendas</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.nombre}
                  </option>
                ))}
              </select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Exportar a Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <FilePdf className="h-4 w-4 mr-2" />
                    Exportar a PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <EmployeesList 
                employees={filteredEmployees}
                onSelectEmployee={setSelectedEmployee}
                loading={loadingEmployees}
              />
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <EmployeePerformance employee={selectedEmployee} />
          </div>
        </div>
      </div>

      <NewEmployeeModal
        open={showNewEmployeeModal}
        onOpenChange={setShowNewEmployeeModal}
      />

      <RolesModal
        open={showRolesModal}
        onOpenChange={setShowRolesModal}
      />
    </div>
  );
}

