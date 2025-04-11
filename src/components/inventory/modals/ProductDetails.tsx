import { X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { Product } from "../types";
import { getTypeIcon } from "../utils";

interface ProductDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductDetailsModal({
  open,
  onOpenChange,
  product,
}: ProductDetailsProps) {
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obtener el id del producto, ya sea en product.id o product._id
  const productId = product?.id || (product as any)?._id;

  // Cargar la información completa del producto desde el backend
  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      api
        .get(`/products/${productId}`)
        .then((response) => {
          setProductDetails(response.data);
          setError("");
        })
        .catch((err) => {
          console.error(err);
          setError("No se pudo cargar la información del producto");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, productId]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-lg p-6">

        {loading ? (
          <div className="py-4 text-center">Cargando...</div>
        ) : error ? (
          <div className="py-4 text-center text-red-600">{error}</div>
        ) : productDetails ? (
          <div className="space-y-4">
            {/* Nombre y sabor */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right font-medium">Nombre</Label>
              <div className="col-span-3">
                {productDetails.name}
                {productDetails.flavor && (
                  <span className="text-sm text-gray-600">
                    {" "}
                    ({productDetails.flavor})
                  </span>
                )}
              </div>
            </div>
            {/* Tipo */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right font-medium">Tipo</Label>
              <div className="col-span-3 flex items-center gap-2">
                {getTypeIcon(productDetails.type)}
                <span className="capitalize">
                  {productDetails.type === "sealed"
                    ? "Sellado"
                    : productDetails.type === "prepared"
                    ? "Preparación"
                    : "Ambos"}
                </span>
              </div>
            </div>
            {/* Precios */}
            {productDetails.type !== "prepared" && (
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium">Precio Catálogo</Label>
                <div className="col-span-3">${productDetails.salePrice}</div>
              </div>
            )}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right font-medium">Precio de Compra</Label>
              <div className="col-span-3">${productDetails.purchasePrice}</div>
            </div>
            {/* Stock Sellado */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-right font-medium">Stock Sellado</Label>
              <div className="col-span-3">
                {productDetails.type === "prepared"
                  ? "N/A"
                  : `${productDetails.stock.sealed} unidades`}
              </div>
            </div>
            {/* Stock Preparación (solo si no es sellado) */}
            {productDetails.type !== "sealed" && (
              <>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right font-medium">
                    Stock Preparación
                  </Label>
                  <div className="col-span-3">
                    {productDetails.stock.preparation.currentPortions} porciones{" "}
                    <span className="text-sm text-gray-600 ml-2">
                      ({productDetails.stock.preparation.units} unidades)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right font-medium">
                    Porciones por Unidad
                  </Label>
                  <div className="col-span-3">
                    {productDetails.stock.preparation.portionsPerUnit}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">No hay información para mostrar.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


