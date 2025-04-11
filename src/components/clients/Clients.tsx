import { useState, useEffect } from "react";
import {
  Users2,
  Plus,
  Search,
  FileSpreadsheet,
  File as FilePdf,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewClientModal } from "./modals/NewClient";
import { EditClientModal } from "./modals/EditClient";
import ClientHistoryModal from "./ClientHistoryModal";
import { Client } from "../../types/clients";
import { useClub } from "@/context/ClubContext";
import api from "@/services/api";

export default function Clients() {
  const { activeClub } = useClub();
  const [clients, setClients] = useState<Client[]>([]);
  const [kpis, setKpis] = useState<{
    totalClientes: number;
    clientesFrecuentes: number;
    mejorCliente: Client | null;
    clienteAsiduo: Client | null;
    ultimaCompra: string | null;
  }>({
    totalClientes: 0,
    clientesFrecuentes: 0,
    mejorCliente: null,
    clienteAsiduo: null,
    ultimaCompra: null,
  });
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "regular" | "wholesale" | "occasional">("all");

  // Función para cargar clientes desde el backend
  const fetchClients = async () => {
    try {
      if (!activeClub) return;
      const res = await api.get(`/clients`, { params: { clubId: activeClub } });
      setClients(res.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  // Función para cargar KPIs
  const fetchKpis = async () => {
    try {
      if (!activeClub) return;
      const res = await api.get(`/clients/kpis`, { params: { clubId: activeClub } });
      // Se formatea la fecha de última compra si existe
      const ultimaCompra = res.data.ultimaCompra
        ? new Date(res.data.ultimaCompra).toLocaleDateString()
        : null;
      setKpis({ ...res.data, ultimaCompra });
    } catch (error) {
      console.error("Error al obtener KPIs:", error);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchKpis();
  }, [activeClub]);

  // Filtro de clientes en el frontend
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || client.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const handleExport = (format: 'excel' | 'pdf') => {
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
                <Users2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-muted-foreground">
                  Gestiona y monitorea todos tus clientes
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewClientModal(true)}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Cliente
            </button>
          </div>

          {/* KPIs Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total de Clientes */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total de Clientes
                  </h3>
                  <Users2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{kpis.totalClientes}</div>
                  <p className="text-sm text-muted-foreground">
                    Clientes registrados
                  </p>
                </div>
              </div>
            </Card>

            {/* Clientes Frecuentes (tipo regular) */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Clientes Frecuentes
                  </h3>
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {kpis.clientesFrecuentes}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clientes regulares
                  </p>
                </div>
              </div>
            </Card>

            {/* Mejor Cliente */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Mejor Cliente
                  </h3>
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  {kpis.mejorCliente ? (
                    <>
                      <div className="text-lg font-bold text-green-600">
                        {kpis.mejorCliente.name}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gastó ${kpis.mejorCliente.total_spent.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin información</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Cliente Asiduo (con mayor visitCount) */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Cliente Con Mas Visitas
                  </h3>
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  {kpis.clienteAsiduo ? (
                    <>
                      <div className="text-lg font-bold text-purple-600">
                        {kpis.clienteAsiduo.name}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {kpis.clienteAsiduo.visitCount} visitas
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin información</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Última Compra */}
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200/50">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Última Compra
                  </h3>
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  {kpis.ultimaCompra ? (
                    <div className="text-lg font-bold text-yellow-600">
                      {kpis.ultimaCompra}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin compras</p>
                  )}
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
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="all">Todos los tipos</option>
                <option value="regular">Regulares</option>
                <option value="wholesale">Mayoristas</option>
                <option value="occasional">Ocasionales</option>
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

        {/* Tabla de Clientes */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Cliente desde {(client.last_purchase || client.createdAt) ? new Date((client.last_purchase || client.createdAt) as string).toLocaleDateString() : "Sin fecha"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        client.type === "regular"
                          ? "bg-blue-100 text-blue-800"
                          : client.type === "wholesale"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {client.type === "regular"
                        ? "Regular"
                        : client.type === "wholesale"
                        ? "Mayorista"
                        : "Ocasional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {client.last_purchase
                        ? new Date(client.last_purchase).toLocaleDateString()
                        : "Sin compras"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowHistoryModal(true);
                        }}
                      >
                        Ver historial
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowEditClientModal(true);
                        }}
                      >
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <NewClientModal
        open={showNewClientModal}
        onOpenChange={(open) => {
          setShowNewClientModal(open);
          if (!open) {
            fetchClients();
            fetchKpis();
          }
        }}
      />

      <EditClientModal
        open={showEditClientModal}
        onOpenChange={(open) => {
          setShowEditClientModal(open);
          if (!open) fetchClients();
        }}
        client={selectedClient}
      />

      {showHistoryModal && selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}

