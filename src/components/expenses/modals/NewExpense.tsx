import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Building2, Loader2, Upload } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useClub } from "@/context/ClubContext";

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  flavor?: string;
  catalogPrice: number;
  salePrice: number;
  type: "sealed" | "prepared" | "both";
  stock: number;
  portions: number;
}

interface NewExpenseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseCreated?: () => void; // Agregar esta prop
}

export function NewExpenseModal({ open, onOpenChange, onExpenseCreated }: NewExpenseProps) {
  const { activeClub } = useClub();
  const { toast } = useToast();

  // Estado para seleccionar la pestaña: "purchase" o "operational"
  const [activeTab, setActiveTab] = useState<"purchase" | "operational">("purchase");

  // Estados para la búsqueda y selección de productos
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  // Estados para cantidades y monto (precio) modificable por el usuario
  const [quantity, setQuantity] = useState<number>(1);
  const [sealedQuantity, setSealedQuantity] = useState<number>(0);
  const [preparedQuantity, setPreparedQuantity] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Estado para los gastos operativos. Se agregó “provider” y “customCategory” para permitir ingresar una categoría nueva
  const [operationalExpense, setOperationalExpense] = useState({
    category: "",
    customCategory: "",
    amount: "",
    description: "",
    provider: "",
  });

  // Buscar productos mediante el endpoint /products/search/expenses
  useEffect(() => {
    if (open && activeClub && searchTerm.trim().length > 0) {
      const fetchProducts = async () => {
        try {
          const res = await api.get("/products/search/expenses", {
            params: { clubId: activeClub, query: searchTerm, limit: 10 },
          });
          setCatalogProducts(res.data);
        } catch (error) {
          console.error("Error al buscar productos:", error);
          toast({
            title: "Error",
            description: "Error al cargar productos para gastos",
            variant: "destructive",
          });
        }
      };
      fetchProducts();
    } else {
      setCatalogProducts([]);
      setSelectedProduct(null);
    }
  }, [open, activeClub, searchTerm, toast]);

  // Al seleccionar un producto se actualiza el monto con el precio del catálogo
  const handleProductSelect = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setAmount(product.catalogPrice);
    // Reiniciamos cantidades al seleccionar otro producto
    setQuantity(1);
    setSealedQuantity(0);
    setPreparedQuantity(0);
  };

  // Función para calcular el total según la edición manual del monto
  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    if (selectedProduct.type === "both") {
      return (sealedQuantity + preparedQuantity) * amount;
    }
    return quantity * amount;
  };

  // Función para enviar el gasto y actualizar el inventario
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validaciones para gastos de productos
      if (activeTab === "purchase") {
        if (!selectedProduct) {
          toast({
            title: "Error",
            description: "Debes seleccionar un producto",
            variant: "destructive",
          });
          return;
        }
        if (selectedProduct.type === "both") {
          if (sealedQuantity <= 0 && preparedQuantity <= 0) {
            toast({
              title: "Error",
              description: "Ingresa cantidades válidas para sellado o preparación",
              variant: "destructive",
            });
            return;
          }
        } else {
          if (quantity <= 0) {
            toast({
              title: "Error",
              description: "La cantidad debe ser mayor a cero",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Para gastos de compra se arma la descripción según el producto seleccionado
      const expenseDescription =
        activeTab === "purchase"
          ? selectedProduct
            ? `Compra de ${selectedProduct.name}${
                selectedProduct.flavor ? " (" + selectedProduct.flavor + ")" : ""
              }`
            : ""
          : operationalExpense.description;

      // Para gastos operativos se valida la categoría: si se eligió "other", se toma la categoría personalizada
      let categoryToUse = operationalExpense.category;
      if (categoryToUse === "other") {
        categoryToUse = operationalExpense.customCategory;
      }

      // Si es gasto de producto, agregamos productId al payload
      const basePayload: any = {
        clubId: activeClub,
        category: activeTab === "purchase" ? "producto" : (operationalExpense.category === "other" ? operationalExpense.customCategory : operationalExpense.category),
        expenseAmount: activeTab === "purchase" ? calculateTotal() : parseFloat(operationalExpense.amount),
        description: activeTab === "purchase"
          ? selectedProduct
            ? `Compra de ${selectedProduct.name}${selectedProduct.flavor ? " (" + selectedProduct.flavor + ")" : ""}`
            : ""
          : operationalExpense.description,
      };

      if (activeTab === "purchase" && selectedProduct) {
        basePayload.productId = selectedProduct.id;

        if (selectedProduct.type === "both") {
          // Registrar movimiento para productos sellados si hay cantidad
          if (sealedQuantity > 0) {
            await api.post("/inventory/movement", {
              productId: selectedProduct.id,
              clubId: activeClub,
              type: "compra",
              quantity: sealedQuantity,
              unit: "sealed",
              purchasePrice: amount, // Agregamos el precio de compra
              description: `Gasto - Compra sellada: ${sealedQuantity} unidades`,
            });
          }
          // Registrar movimiento para productos de preparación si hay cantidad
          if (preparedQuantity > 0) {
            await api.post("/inventory/movement", {
              productId: selectedProduct.id,
              clubId: activeClub,
              type: "compra",
              quantity: preparedQuantity,
              unit: "portion",
              purchasePrice: amount, // Agregamos el precio de compra
              description: `Gasto - Compra para preparación: ${preparedQuantity} porciones`,
            });
          }
        } else {
          const unit = selectedProduct.type === "sealed" ? "sealed" : "portion";
          await api.post("/inventory/movement", {
            productId: selectedProduct.id,
            clubId: activeClub,
            type: "compra",
            quantity,
            unit,
            purchasePrice: amount, // Agregamos el precio de compra
            description: `Gasto - Compra de ${selectedProduct.type}: ${quantity} unidades`,
          });
        }
      }

      if (activeTab === "operational") {
        // Se pueden agregar campos adicionales para gastos operativos, por ejemplo, provider
        basePayload.provider = operationalExpense.provider;
      }

      // Registrar el gasto en el endpoint de expenses
      await api.post("/expenses", basePayload);

      toast({
        title: "Éxito",
        description: "Gasto registrado correctamente",
        variant: "default",
      });
      if (onExpenseCreated) {
        onExpenseCreated();
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al registrar gasto:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Error al registrar el gasto",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de gasto y completa la información correspondiente.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "purchase" | "operational")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 border-b mb-4">
            <TabsTrigger value="purchase" className="flex items-center gap-2 py-2">
              <Package className="h-4 w-4 text-primary" />
              Compra de Productos
            </TabsTrigger>
            <TabsTrigger value="operational" className="flex items-center gap-2 py-2">
              <Building2 className="h-4 w-4 text-primary" />
              Gasto Operativo
            </TabsTrigger>
          </TabsList>

          {/* Pestaña para compra de productos */}
          <TabsContent value="purchase" className="space-y-6">
            <div className="space-y-4">
              {/* Buscador de producto */}
              <div className="space-y-2">
                <Label>Buscar Producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por nombre o SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Lista de resultados */}
              <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                {catalogProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id
                        ? "bg-primary/5"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {product.name}{" "}
                            {product.flavor ? `(${product.flavor})` : ""}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {product.sku}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {product.type === "sealed" ? (
                          <>Stock: {product.stock} unidades</>
                        ) : product.type === "prepared" ? (
                          <>Stock: {product.portions} porciones</>
                        ) : (
                          <>
                            Sellados: {product.stock} / Porciones:{" "}
                            {product.portions}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulario para productos */}
              {selectedProduct && (
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  {selectedProduct.type !== "both" ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          max={
                            selectedProduct.type === "sealed"
                              ? selectedProduct.stock
                              : undefined
                          }
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                      <div>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) =>
                            setAmount(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <div className="h-10 px-3 rounded-md border bg-gray-100 flex items-center">
                          ${ (amount * quantity).toLocaleString() }
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Para productos duales, indica la cantidad para cada tipo:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cantidad Sellado</Label>
                          <Input
                            type="number"
                            min="0"
                            value={sealedQuantity}
                            onChange={(e) =>
                              setSealedQuantity(parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <Label>Cantidad Preparación</Label>
                          <Input
                            type="number"
                            min="0"
                            value={preparedQuantity}
                            onChange={(e) =>
                              setPreparedQuantity(parseInt(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) =>
                            setAmount(parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div>
                        <Label>Total</Label>
                        <div className="h-10 px-3 rounded-md border bg-gray-100 flex items-center">
                          ${ ((sealedQuantity + preparedQuantity) * amount).toLocaleString() }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pestaña para gastos operativos */}
          <TabsContent value="operational" className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={operationalExpense.category}
                  onValueChange={(value) =>
                    setOperationalExpense((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Renta</SelectItem>
                    <SelectItem value="services">Servicios</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {operationalExpense.category === "other" && (
                  <div className="mt-2">
                    <Label>Categoría Personalizada</Label>
                    <Input
                      placeholder="Ingresa la categoría"
                      value={operationalExpense.customCategory}
                      onChange={(e) =>
                        setOperationalExpense((prev) => ({
                          ...prev,
                          customCategory: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={operationalExpense.amount}
                  onChange={(e) =>
                    setOperationalExpense((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  placeholder="Ej: Pago de luz mensual"
                  value={operationalExpense.description}
                  onChange={(e) =>
                    setOperationalExpense((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Proveedor</Label>
                <Input
                  placeholder="Nombre del proveedor"
                  value={operationalExpense.provider}
                  onChange={(e) =>
                    setOperationalExpense((prev) => ({
                      ...prev,
                      provider: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="border rounded-lg p-4 bg-gray-100">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label className="cursor-pointer">
                      Adjuntar Comprobante
                    </Label>
                    <p className="text-sm text-gray-500">
                      Arrastra y suelta un archivo o haz clic para seleccionar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-end space-x-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </div>
            ) : (
              "Guardar Gasto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}





