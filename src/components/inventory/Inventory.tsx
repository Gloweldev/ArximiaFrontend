import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Boxes,
  Search,
  Plus,
  Wallet,
  TrendingUp,
  ArrowUpDown,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClub } from "@/context/ClubContext";
import api from "@/services/api";
import { RegisterInventoryModal } from "./modals/RegisterInventory";
import { ProductDetailsModal } from "./modals/ProductDetails";
import { MovementHistoryModal } from "./modals/MovementHistory";
import { AdjustStockModal } from "./modals/AdjustStock";
import { getTypeIcon, getStatusColor } from "./utils";

export default function Inventory() {
  const { activeClub } = useClub();

  interface InventoryItem {
    product: {
      name: string;
      type: string;
      purchasePrice?: number;
      status: string;
      flavor?: string;
    };
    sealed?: number;
    preparation?: {
      currentPortions?: number;
      units?: number;
    };
    updatedAt: string;
    _id: string;
  }

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Estados para modales
  const [showNewInventoryModal, setShowNewInventoryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAdjustStockModal, setShowAdjustStockModal] = useState(false);

  // Función para refrescar datos de inventario
  const refreshData = async () => {
    try {
      setLoading(true);
      if (activeClub) {
        const inventoryResponse = await api.get(`/inventory/club/${activeClub}`);
        setInventory(inventoryResponse.data);
      }
    } catch (err) {
      setError("Error al actualizar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeClub]);

  // Filtrar inventario según búsqueda y tab seleccionado
  const filteredInventory = inventory.filter((item) => {
    const product = item.product;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesTab = true;
    if (selectedTab === "low") {
      // Stock bajo: sellados o preparación con stock menor a 10
      matchesTab = ((item.sealed ?? 0) < 10) || ((item.preparation?.currentPortions ?? 0) < 10);
    } else if (selectedTab !== "all") {
      matchesTab = product.type === selectedTab;
    }
    return matchesSearch && matchesTab;
  });

  // Calcular inversión total: se utiliza el precio de compra y la cantidad total de stock
  const totalInvestment = inventory.reduce((acc, item) => {
    const product = item.product;
    const purchasePrice = product.purchasePrice || 0;
    const sealedQty = item.sealed || 0;
    const prepUnits = item.preparation?.units || 0;
    return acc + (sealedQty + prepUnits) * purchasePrice;
  }, 0);

  // Calcular cantidad de productos con stock bajo
  const lowStockCount = inventory.filter((item) => {
    return ((item.sealed ?? 0) < 10) || ((item.preparation?.currentPortions ?? 0) < 10);
  }).length;

  const handleExport = (format: 'excel' | 'pdf') => {
    console.log(`Exportando en formato ${format}`);
    // Implementa la exportación a Excel o PDF según sea necesario
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center shadow-lg">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Inventario
              </h1>
              <p className="text-muted-foreground">
                Gestiona tu inventario de productos y preparaciones
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inversión Total</CardTitle>
              <Wallet className="h-4 w-4 text-green-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ${totalInvestment.toLocaleString()}
              </div>
              <p className="text-xs text-green-700/70">
                Costo total de compra
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
              <Boxes className="h-4 w-4 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {inventory.length}
              </div>
              <p className="text-xs text-blue-700/70">
                Total de productos en inventario
              </p>
            </CardContent>
          </Card>

          <Card
            className="shadow-lg bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 cursor-pointer"
            onClick={() => setSelectedTab("low")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {lowStockCount}
              </div>
              <p className="text-xs text-purple-700/70">
                Productos con stock bajo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl bg-white/90 dark:bg-neutral-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Productos en Inventario</CardTitle>
            <CardDescription>
              Gestiona tus productos sellados y preparaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="space-y-4" onValueChange={setSelectedTab}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <TabsList className="bg-gray-100 dark:bg-gray-800 w-full lg:w-auto rounded-md shadow-sm">
                  <TabsTrigger value="all" className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                    Todos
                  </TabsTrigger>
                  <TabsTrigger value="sealed" className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                    Sellados
                  </TabsTrigger>
                  <TabsTrigger value="preparation" className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                    Preparaciones
                  </TabsTrigger>
                  <TabsTrigger value="low" className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                    Stock Bajo
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-col gap-2 sm:flex-row w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar producto..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 sm:flex-none">
                    <Button
                      onClick={() => setShowNewInventoryModal(true)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar
                    </Button>
                  </div>
                </div>
              </div>
              <TabsContent value="all" className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-gray-200 dark:bg-gray-700">
                        <TableRow className="text-gray-700 dark:text-gray-200">
                          <TableHead className="w-[300px] px-4 py-2">Producto</TableHead>
                          <TableHead className="px-4 py-2">Tipo</TableHead>
                          <TableHead className="px-4 py-2">Stock Sellado</TableHead>
                          <TableHead className="px-4 py-2">Stock Preparación</TableHead>
                          <TableHead className="px-4 py-2">Última Actualización</TableHead>
                          <TableHead className="px-4 py-2">Estado</TableHead>
                          <TableHead className="px-4 py-2 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => {
                          const { product, sealed, preparation, updatedAt } = item;
                          return (
                            <TableRow
                              key={item._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <TableCell className="font-medium px-4 py-2">
                                {product.name}
                                {product.flavor && ` (${product.flavor})`}
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(product.type)}
                                  <span className="capitalize">
                                    {product.type === "sealed"
                                      ? "Sellado"
                                      : product.type === "prepared"
                                      ? "Preparación"
                                      : "Ambos"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                {product.type === "prepared" ? "N/A" : (sealed ?? "N/A")} unidades
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                {product.type !== "sealed" ? (
                                  <div>
                                    <div>{preparation?.currentPortions ?? "N/A"} porciones</div>
                                    <div className="text-sm text-gray-500">
                                      ({preparation?.units ?? "N/A"} unidades)
                                    </div>
                                  </div>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                {new Date(updatedAt).toLocaleString() || "N/A"}
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                <Badge className={`${getStatusColor(product.status as "low" | "normal" | "critical")}`}>
                                  {product.status === "normal"
                                    ? "Normal"
                                    : product.status === "low"
                                    ? "Bajo"
                                    : "Crítico"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-2 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Abrir menú</span>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 shadow-md">
                                    <DropdownMenuLabel className="px-4 py-2">Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      onClick={() => {
                                        setSelectedInventory(item);
                                        setShowDetailsModal(true);
                                      }}
                                    >
                                      Ver detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      onClick={() => {
                                        setSelectedInventory(item);
                                        setShowHistoryModal(true);
                                      }}
                                    >
                                      Ver historial
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal para Registrar Inventario */}
      <Dialog open={showNewInventoryModal} onOpenChange={setShowNewInventoryModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Inventario</DialogTitle>
            <DialogDescription>
              Añade nuevos productos a tu inventario
            </DialogDescription>
          </DialogHeader>
          <RegisterInventoryModal
            open={showNewInventoryModal}
            onOpenChange={setShowNewInventoryModal}
            onSuccess={() => {
              setShowNewInventoryModal(false);
              refreshData();
              toast({
                title: "Inventario registrado",
                description: "El inventario ha sido registrado correctamente",
              });
            }}
            clubId={activeClub || ""}
            catalogProducts={[]} // Aquí debes obtener los productos reales desde la API o contexto
            onClose={() => setShowNewInventoryModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles del Producto</DialogTitle>
            <DialogDescription>
              Información detallada del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedInventory && (
            <ProductDetailsModal
              open={showDetailsModal}
              onOpenChange={setShowDetailsModal}
              product={selectedInventory.product}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Historial */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Movimientos</DialogTitle>
            <DialogDescription>
              Registro de transacciones para el producto seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedInventory && (
            <MovementHistoryModal
              open={showHistoryModal}
              onClose={() => setShowHistoryModal(false)}
              productId={selectedInventory._id}
              productName={selectedInventory.product.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



