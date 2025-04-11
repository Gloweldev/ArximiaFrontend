import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Coffee, User, Calendar, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import api from "@/services/api";

interface SaleDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: {
    id: string;
    created_at?: string;
    createdAt?: string; // Considerar ambos formatos de fecha
    total: number;
    items?: {
      id: string;
      name: string;
      type: "sealed" | "preparation";
      quantity: number;
      price: number;
      portions?: number;
    }[];
    customer?: {
      name: string;
      phone: string;
    };
    employee: {
      id: string;
      name: string;
      avatar?: string;
    };
    status: "completed" | "cancelled";
  } | null;
}

export function SaleDetailsModal({ open, onOpenChange, sale }: SaleDetailsProps) {
  const [detailedSale, setDetailedSale] = useState<typeof sale>(sale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Consulta detalles de la venta al recibir el id
  useEffect(() => {
    if (sale && sale.id && open) {
      setLoading(true);
      setError(null);
      console.log("Fetching details for sale ID:", sale.id);
      
      api.get(`/sales/${sale.id}`)
        .then((response) => {
          console.log("Sale details response:", response.data);
          // Asegurar que la estructura de datos es compatible
          const formattedSale = {
            ...response.data,
            id: response.data.id || response.data._id,
            created_at: response.data.created_at || response.data.createdAt,
            // Asegurar que items existe
            items: response.data.items || []
          };
          setDetailedSale(formattedSale);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error obteniendo detalles de la venta:", error);
          setError("Error al cargar los detalles de la venta. Intente nuevamente.");
          setLoading(false);
        });
    }
  }, [sale, open]);

  if (!open) return null;
  
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <div className="text-center">Cargando detalles...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-red-500">{error}</div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  if (!detailedSale) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          <div className="text-center">No se encontraron detalles de la venta.</div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Utilizar cualquiera de los dos formatos de fecha
  const saleDate = detailedSale.created_at || detailedSale.createdAt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles de la Venta</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {saleDate 
                    ? format(new Date(saleDate), "d 'de' MMMM, yyyy", { locale: es })
                    : "Fecha no disponible"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {saleDate 
                    ? format(new Date(saleDate), "HH:mm")
                    : ""}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                detailedSale.status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }
            >
              {detailedSale.status === "completed" ? "Completada" : "Cancelada"}
            </Badge>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="font-medium">Productos</h3>
            <div className="space-y-2">
              {(detailedSale.items || []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {item.type === "sealed" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        <Package className="h-3 w-3 mr-1" />
                        Sellado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        <Coffee className="h-3 w-3 mr-1" />
                        Preparación
                      </Badge>
                    )}
                    <span>{item.name}</span>
                    <span className="text-muted-foreground ml-1">
                      x{item.quantity}
                      {item.portions && ` (${item.portions} porciones)`}
                    </span>
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer */}
          {detailedSale.customer && (
            <div className="space-y-2">
              <h3 className="font-medium">Cliente</h3>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{detailedSale.customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {detailedSale.customer.phone}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Employee */}
          <div className="space-y-2">
            <h3 className="font-medium">Vendedor</h3>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              {detailedSale.employee.avatar ? (
                <img
                  src={detailedSale.employee.avatar}
                  alt={detailedSale.employee.name}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{detailedSale.employee.name}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold">
              ${detailedSale.total.toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}