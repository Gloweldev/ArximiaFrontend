import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ShoppingBag,
  Building2,
  Zap,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Printer,
} from "lucide-react";

interface ExpenseDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    status: string;
    attachments: number;
  } | null;
}

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

export function ExpenseDetailsModal({
  open,
  onOpenChange,
  expense,
}: ExpenseDetailsProps) {
  if (!expense) return null;

  const CategoryIcon =
    categoryIcons[expense.category as keyof typeof categoryIcons].icon;
  const categoryColor =
    categoryIcons[expense.category as keyof typeof categoryIcons].color;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Gasto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {format(new Date(expense.date), "d 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(expense.date), "HH:mm")}
                </div>
              </div>
            </div>
            {expense.status === "approved" ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprobado
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pendiente
              </Badge>
            )}
          </div>

          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className={`h-5 w-5 ${categoryColor}`} />
              <span className="font-medium">
                {categoryNames[expense.category as keyof typeof categoryNames]}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Descripción
              </h3>
              <p>{expense.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Monto
              </h3>
              <p className="text-2xl font-bold">
                ${expense.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {expense.attachments > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Comprobantes
              </h3>
              <div className="space-y-2">
                {Array.from({ length: expense.attachments }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>Comprobante {index + 1}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}