import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Archive, Package, Coffee } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    type: "sealed" | "prepared" | "both";
    portions?: number;
    portionSize?: string;
    portionPrice?: number; // Agregado
    salePrice: number;
    purchasePrice: number;
    category: string;
    flavor?: string; // Agregado
    imageUrl?: string;
  };
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
}

export function ProductCard({ product, onEdit, onArchive }: ProductCardProps) {
  const isSealed = product.type === "sealed" || product.type === "both";
  const isPrepared = product.type === "prepared" || product.type === "both";

  // Formateo de precios con dos decimales
  const formattedSalePrice = typeof product.salePrice === "number" ? product.salePrice.toFixed(2) : "0.00";
  const formattedPurchasePrice = typeof product.purchasePrice === "number" ? product.purchasePrice.toFixed(2) : "0.00";
  const formattedPortionPrice = typeof product.portionPrice === "number" ? product.portionPrice.toFixed(2) : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 dark:hover:shadow-primary/5 backdrop-blur-sm bg-background/50">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isSealed && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <Package className="w-3 h-3 mr-1" />
                  Sellado
                </Badge>
              )}
              {isPrepared && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Coffee className="w-3 h-3 mr-1" />
                  Preparado
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg leading-none">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {product.brand}{product.flavor && ` - ${product.flavor}`}
            </p>
          </div>
          {product.imageUrl && (
            <div className="w-16 h-16 rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-3">
          <div className="space-y-1">
            {/* Precio de compra (siempre visible) */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Precio de compra:</span>
              <span className="font-medium">${formattedPurchasePrice}</span>
            </div>

            {/* Precio de venta (solo para sellado o ambos) */}
            {isSealed && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precio de venta:</span>
                <span className="font-medium">${formattedSalePrice}</span>
              </div>
            )}

            {/* Información de preparación (solo para preparado o ambos) */}
            {isPrepared && (
              <div>
                {product.portions && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Porciones: </span>
                    {product.portions} {product.portionSize && `(${product.portionSize})`}
                  </p>
                )}
                {formattedPortionPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Precio por porción:</span>
                    <span className="font-medium">${formattedPortionPrice}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product.id)}
              className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(product.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Archive className="h-4 w-4" />
              <span className="sr-only">Archivar</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}