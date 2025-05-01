import { useState, useEffect, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, Package, Coffee, HelpCircle, CreditCard } from "lucide-react";
import api from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { ProductType, Product } from "../types";

interface RegisterInventoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clubId: string;
  onClose: () => void;
}

export function RegisterInventoryModal({
  open,
  onOpenChange,
  onSuccess,
  clubId,
  onClose,
}: RegisterInventoryProps) {
  const [searchInput, setSearchInput] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [formData, setFormData] = useState({
    useCatalogPrice: true,
    purchasePrice: "",
    totalUnits: "",
    sealedUnits: "",
    preparationUnits: "",
    registerAsExpense: true, // Nuevo campo
  });

  // Función de debounce para búsquedas
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Búsqueda de productos con validación mejorada
  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.trim().length < 1) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get("/products/search", { 
        params: { 
          clubId, 
          query: query.trim() 
        } 
      });
      
      const safeProducts = response.data.map((p: Product) => ({
        ...p,
        purchasePrice: p.catalogPrice || 0,
        type: p.type || "sealed",
        // Se asegura de obtener el sabor (flavor)
        flavor: p.flavor || null,
        stock: p.stock || { 
          sealed: 0, 
          preparation: { units: 0, portionsPerUnit: 0, currentPortions: 0 } 
        }
      }));
      
      setProducts(safeProducts);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al buscar productos",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  // Búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => searchProducts(query), 300),
    [debounce, searchProducts]
  );

  useEffect(() => {
    if (open) {
      setSearchInput("");
      setProducts([]);
      setSelectedProduct(null);
    }
  }, [open]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Se muestra "Producto (Sabor)" si existe flavor
    const displayName = product.flavor ? `${product.name} (${product.flavor})` : product.name;
    setSearchInput(displayName);
    setShowResults(false);
    setFormData(prev => ({
      ...prev,
      purchasePrice: product.catalogPrice.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Debe seleccionar un producto",
        variant: "destructive",
      });
      return;
    }

    try {
      const price = parseFloat(formData.purchasePrice) || 0;
      const movementType = formData.registerAsExpense ? "compra" : "ajuste";
      
      // Se preparará el movimiento según el tipo del producto
      if (selectedProduct.type === "sealed") {
        const totalUnits = parseInt(formData.totalUnits) || 0;
        if (totalUnits <= 0) {
          toast({
            title: "Error",
            description: "La cantidad debe ser mayor a 0",
            variant: "destructive",
          });
          return;
        }
        
        const productDesc = selectedProduct.flavor 
          ? `${selectedProduct.name} - ${selectedProduct.flavor}`
          : selectedProduct.name;
        
        await api.post("/inventory/movement", {
          productId: selectedProduct.id,
          clubId,
          type: movementType,
          quantity: totalUnits,
          unit: "sealed",
          purchasePrice: formData.registerAsExpense ? price : undefined,
          description: formData.registerAsExpense 
            ? `Compra de inventario ${productDesc}`
            : `Ajuste de inventario: ${productDesc} - ${totalUnits} unidades`,
        });
      } else if (selectedProduct.type === "prepared") {
        const totalUnits = parseInt(formData.totalUnits) || 0;
        if (totalUnits <= 0) {
          toast({
            title: "Error",
            description: "La cantidad debe ser mayor a 0",
            variant: "destructive",
          });
          return;
        }
        const productDesc = selectedProduct.flavor 
          ? `${selectedProduct.name} - ${selectedProduct.flavor}`
          : selectedProduct.name;

        await api.post("/inventory/movement", {
          productId: selectedProduct.id,
          clubId,
          type: movementType,
          quantity: totalUnits,
          unit: "portion",
          purchasePrice: formData.registerAsExpense ? price : undefined,
          description: formData.registerAsExpense 
            ? `Compra de inventario ${productDesc}`
            : `Ajuste de inventario: ${productDesc} - ${totalUnits} unidades`,
        });
      } else if (selectedProduct.type === "both") {
        const sealedUnits = parseInt(formData.sealedUnits) || 0;
        const prepUnits = parseInt(formData.preparationUnits) || 0;
        if (sealedUnits <= 0 && prepUnits <= 0) {
          toast({
            title: "Error",
            description: "Debe ingresar al menos una cantidad válida",
            variant: "destructive",
          });
          return;
        }

        const productDesc = selectedProduct.flavor 
          ? `${selectedProduct.name} - ${selectedProduct.flavor}`
          : selectedProduct.name;

        if (sealedUnits > 0) {
          await api.post("/inventory/movement", {
            productId: selectedProduct.id,
            clubId,
            type: movementType,
            quantity: sealedUnits,
            unit: "sealed",
            purchasePrice: formData.registerAsExpense ? price : undefined,
            description: formData.registerAsExpense 
              ? `Compra de inventario ${productDesc} (Sellado)`
              : `Ajuste de inventario: ${productDesc} - ${sealedUnits} unidades (Sellado)`,
          });
        }
        
        if (prepUnits > 0) {
          await api.post("/inventory/movement", {
            productId: selectedProduct.id,
            clubId,
            type: movementType,
            quantity: prepUnits,
            unit: "portion",
            purchasePrice: formData.registerAsExpense ? price : undefined,
            description: formData.registerAsExpense 
              ? `Compra de inventario ${productDesc} (Preparación)`
              : `Ajuste de inventario: ${productDesc} - ${prepUnits} unidades (Preparación)`,
          });
        }
      }
      
      toast({
        title: "Éxito",
        description: formData.registerAsExpense 
          ? "Inventario registrado y se han actualizado los movimientos en gastos"
          : "Inventario actualizado correctamente",
      });
      
      onOpenChange(false);
      onSuccess();
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Error al registrar movimiento",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSearchInput("");
    setSelectedProduct(null);
    setFormData({
      useCatalogPrice: true,
      purchasePrice: "",
      totalUnits: "",
      sealedUnits: "",
      preparationUnits: "",
      registerAsExpense: true, // Nuevo campo
    });
  };

  const renderTypeIcon = (type: ProductType) => {
    switch (type) {
      case "sealed":
        return <Package className="h-4 w-4 mr-2 text-blue-500" />;
      case "prepared":
        // Icono de tacita para productos de preparación
        return <Coffee className="h-4 w-4 mr-2 text-yellow-500" />;
      case "both":
        return (
          <div className="relative mr-2">
            <Package className="h-4 w-4 text-blue-500" />
            <Coffee className="h-3 w-3 absolute -bottom-1 -right-1 text-yellow-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-[500px] p-6 rounded-lg shadow-lg bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Registrar Nuevo Inventario <CreditCard className="h-6 w-6 text-indigo-600" />
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Busca un producto, especifica las cantidades y el precio de compra.
            <br />
            <span className="font-medium">Nota:</span> Estos cambios se registrarán en los gastos.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Campo de búsqueda con tooltip de ayuda */}
            <div className="grid gap-1 relative">
              <div className="flex items-center gap-1">
                <Label className="font-semibold">Producto</Label>
                <Popover>
                  <PopoverTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                    Busca el producto por su nombre y sabor. Al seleccionar se mostrará en el formato "Producto (Sabor)".
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                placeholder="Buscar producto..."
                value={searchInput}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="border rounded-md shadow-sm"
              />
              
              {showResults && (
                <div className="absolute top-14 z-10 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                  {loading ? (
                    <div className="p-3 text-sm text-gray-500">
                      Buscando...
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">
                      {searchInput.length > 0
                        ? "No se encontraron resultados"
                        : "Empieza a escribir para buscar"}
                    </div>
                  ) : (
                    products.map((product) => {
                      const displayName = product.flavor ? `${product.name} (${product.flavor})` : product.name;
                      return (
                        <div
                          key={product.id}
                          className="p-2 text-sm cursor-pointer hover:bg-indigo-100 transition-colors"
                          onMouseDown={() => handleProductSelect(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {renderTypeIcon(product.type)}
                              <span>{displayName}</span>
                            </div>
                            <span className="ml-2 text-gray-500">
                              ${product.catalogPrice?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {selectedProduct && (
              <>
                {/* Precio de compra con tooltip */}
                <div className="grid gap-1">
                  <div className="flex items-center gap-1">
                    <Label className="font-semibold">Precio de compra</Label>
                    <Popover>
                      <PopoverTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                        Si se marca el checkbox se usará el precio del catálogo; de lo contrario, podrás editar el precio de compra.
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, purchasePrice: e.target.value })
                      }
                      className="pl-9 border rounded-md shadow-sm"
                      min="0"
                      disabled={formData.useCatalogPrice}
                    />
                  </div>
                </div>

                {/* Checkbox para usar precio del catálogo */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useCatalogPrice"
                    checked={formData.useCatalogPrice}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, useCatalogPrice: !!checked, purchasePrice: selectedProduct.catalogPrice.toString() })
                    }
                  />
                  <Label htmlFor="useCatalogPrice" className="text-sm">
                    Usar precio del catálogo
                  </Label>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                      Marcando esta opción se usará el precio predefinido del catálogo y no se podrá editar.
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Nuevo checkbox para registrar como gasto */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="registerAsExpense"
                    checked={formData.registerAsExpense}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, registerAsExpense: !!checked })
                    }
                  />
                  <Label htmlFor="registerAsExpense" className="text-sm">
                    Registrar compra como un gasto
                  </Label>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                      Si está marcado, el movimiento se registrará como una compra y generará un gasto.
                      Si se desmarca, se registrará como un ajuste de inventario sin afectar los gastos.
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cantidades según tipo de producto */}
                {selectedProduct.type !== "both" ? (
                  <div className="grid gap-1">
                    <div className="flex items-center gap-1">
                      <Label className="font-semibold">
                        Cantidad total {selectedProduct.type === "sealed" ? "(unidades)" : "(unidades para porciones)"}
                      </Label>
                      <Popover>
                        <PopoverTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                          Ingresa la cantidad total de unidades compradas.
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.totalUnits}
                      onChange={(e) =>
                        setFormData({ ...formData, totalUnits: e.target.value })
                      }
                      className="border rounded-md shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-1">
                        <Label className="font-semibold">Unidades para venta sellada</Label>
                        <Popover>
                          <PopoverTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </PopoverTrigger>
                          <PopoverContent className="w-60 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                            Ingresa la cantidad de unidades destinadas a la venta sellada.
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={formData.sealedUnits}
                        onChange={(e) =>
                          setFormData({ ...formData, sealedUnits: e.target.value })
                        }
                        className="border rounded-md shadow-sm"
                      />
                    </div>
                    <div className="grid gap-1">
                      <div className="flex items-center gap-1">
                        <Label className="font-semibold">Unidades para preparación</Label>
                        <Popover>
                          <PopoverTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </PopoverTrigger>
                          <PopoverContent className="w-60 p-2 text-sm text-gray-700 bg-gray-100 rounded shadow-md">
                            Ingresa la cantidad de unidades destinadas a preparación (porciones).
                          </PopoverContent>
                        </Popover>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        value={formData.preparationUnits}
                        onChange={(e) =>
                          setFormData({ ...formData, preparationUnits: e.target.value })
                        }
                        className="border rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose} className="px-4 py-2 rounded-md">
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedProduct} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

