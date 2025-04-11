import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "../types";

interface AdjustStockProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function AdjustStockModal({
  open,
  onOpenChange,
  product,
}: AdjustStockProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            {product.name} - Ajuste manual de inventario
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {product.type !== "preparation" && (
            <div className="grid gap-2">
              <Label>Stock Sellado</Label>
              <Input
                type="number"
                defaultValue={product.stock.sealed}
              />
            </div>
          )}
          {product.type !== "sealed" && (
            <>
              <div className="grid gap-2">
                <Label>Unidades para Preparación</Label>
                <Input
                  type="number"
                  defaultValue={product.stock.preparation.units}
                />
              </div>
              <div className="grid gap-2">
                <Label>Porciones Actuales</Label>
                <Input
                  type="number"
                  defaultValue={product.stock.preparation.currentPortions}
                />
              </div>
            </>
          )}
          <div className="grid gap-2">
            <Label>Motivo del Ajuste</Label>
            <Input placeholder="Ej: Inventario físico, merma, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Ajuste</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}