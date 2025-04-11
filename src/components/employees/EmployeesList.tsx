import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  MoreVertical,
  Edit,
  Trash2,
  Award,
  Clock,
  Store,
} from "lucide-react";
import { EditEmployeeModal } from "./modals/EditEmployee";
import api from "@/services/api";
import { toast } from "sonner";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  lastAccess: string | null;
  passwordChanged: boolean;
  club?: {
    _id: string;
    nombre: string;
  };
  status: string;
}

interface Props {
  employees: any[];
  onSelectEmployee: React.Dispatch<any>;
  loading: boolean;
  // other props if any
}

export function EmployeesList({ onSelectEmployee, loading }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  // Mapa para almacenar temporalmente la contraseña para cada empleado pendiente
  const [tempPasswords, setTempPasswords] = useState<{ [key: string]: string }>({});

  // Cargar empleados desde la base de datos
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get("/employees");
        const employeeArray = Array.isArray(data) ? data : data.employees;
        setEmployees(employeeArray || []);
      } catch (error: any) {
        toast.error(
          error.response?.data.message || "Error al cargar los empleados"
        );
      }
    };

    fetchEmployees();
  }, []);

  // Función para abrir el modal de edición
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  // Función para consultar la contraseña temporal de un empleado
  const handleViewTempPassword = async (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data } = await api.get(`/employees/${employeeId}/temp-password`);
      setTempPasswords(prev => ({ ...prev, [employeeId]: data.tempPassword }));
      toast.success("Contraseña temporal obtenida");
    } catch (error: any) {
      toast.error(
        error.response?.data.message || "Error al obtener la contraseña"
      );
    }
  };

  return (
    <>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Último Acceso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Cargando empleados...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No se encontraron empleados con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow
                  key={employee._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectEmployee(employee)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      {employee.role}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {employee.club ? employee.club.nombre : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {employee.lastAccess ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(employee.lastAccess), "d MMM, HH:mm", {
                            locale: es,
                          })}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>No accedido</span>
                          </div>
                          {/* Solo mostrar botón si el empleado no ha cambiado la contraseña */}
                          {!employee.passwordChanged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => handleViewTempPassword(employee._id, e)}
                            >
                              Ver Contraseña Temporal
                            </Button>
                          )}
                          {tempPasswords[employee._id] && (
                            <div className="text-xs text-blue-600">
                              {tempPasswords[employee._id]}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === "Activo" ? "default" : "secondary"
                      }
                      className={
                        employee.status === "Activo"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {employee.status === "Activo" ? "Activo" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(employee)}>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditEmployeeModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        employee={selectedEmployee}
      />
    </>
  );
}
