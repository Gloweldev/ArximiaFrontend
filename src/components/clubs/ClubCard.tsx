// ClubCard.tsx
import { Club } from "./types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Users,
  DollarSign,
  MoreVertical,
  Edit,
  Settings,
  Trash2,
} from "lucide-react";

interface ClubCardProps {
  club: Club;
  onEdit: (club: Club) => void;
  onDelete: (club: Club) => void;
}

export function ClubCard({ club, onEdit, onDelete }: ClubCardProps) {
  // Calcula el porcentaje de avance respecto a la meta de ventas
  const salesProgress = (club.monthlyStats.sales / club.monthlyStats.salesGoal) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video relative">
        <img
          src={club.image}
          alt={club.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors">
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(club)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(club)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{club.name}</h3>
            <Badge
              variant={club.status === "active" ? "default" : "secondary"}
              className={
                club.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {club.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {club.address}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Ventas del mes</div>
            <div className="font-semibold">
              ${club.monthlyStats.sales.toLocaleString()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Gastos del mes</div>
            <div className="font-semibold">
              ${club.monthlyStats.expenses.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Meta de ventas</span>
            <span className="font-medium">{salesProgress.toFixed(0)}%</span>
          </div>
          <Progress value={salesProgress} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            {club.employeesCount} empleados
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            {club.paymentMethods.length} métodos de pago
          </div>
        </div>
      </div>
    </Card>
  );
}
