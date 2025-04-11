import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Package, 
  Coffee, 
  Upload, 
  ShoppingCart, 
  Tag, 
  DollarSign, 
  Briefcase,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
  HelpCircle,
  ShoppingBag,
  Loader2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/services/api";
import { useClub } from "@/context/ClubContext";
import { toast } from "@/hooks/use-toast";

interface ProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ProductForm({ onSubmit, onCancel, initialData }: ProductFormProps) {
  const [step, setStep] = useState(1);
  const { activeClub } = useClub();
  const [formData, setFormData] = useState({
    type: initialData?.type || "",
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    portions: initialData?.portions || "",
    hasPortionSize: initialData?.portionSize ? true : false,
    portionSize: initialData?.portionSize || "",
    hasPortionPrice: initialData?.portionPrice ? true : false,
    portionPrice: initialData?.portionPrice || "",
    salePrice: initialData?.salePrice || "",
    purchasePrice: initialData?.purchasePrice || "",
    flavor: initialData?.flavor || "", // Agrega esta línea
    imageUrl: initialData?.imageUrl || "",
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.type) newErrors.type = "Selecciona un tipo de producto";
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "El nombre es requerido";
    // Marca es opcional, no se valida
    if (!formData.category) newErrors.category = "La categoría es requerida";
    return newErrors;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.purchasePrice) newErrors.purchasePrice = "El precio de compra es requerido";
    
    if (formData.type === "sealed" || formData.type === "both") {
      if (!formData.salePrice) newErrors.salePrice = "El precio de venta es requerido";
      if (Number(formData.salePrice) <= Number(formData.purchasePrice)) {
        newErrors.salePrice = "El precio de venta debe ser mayor al precio de compra";
      }
    }
    
    if ((formData.type === "prepared" || formData.type === "both") && !formData.portions) {
      newErrors.portions = "Las porciones son requeridas para productos preparados";
    }
    
    return newErrors;
  };

  const handleNext = () => {
    let stepErrors = {};
    if (step === 1) {
      stepErrors = validateStep1();
    } else if (step === 2) {
      stepErrors = validateStep2();
    } else {
      stepErrors = validateStep3();
    }
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        // Si es el último paso, el envío se realizará desde onSubmit del form.
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle file drop logic here
  };

  const renderHelpIcon = (content: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 ml-1">
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="sr-only">Ayuda</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 text-sm p-3">
        {content}
      </PopoverContent>
    </Popover>
  );

  const validateAllSteps = () => {
    return {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3()
    };
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Evitar envíos simultáneos
    setIsSubmitting(true);
    console.log("Envío iniciado");
    const allErrors = validateAllSteps();
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      console.log("Errores de validación:", allErrors);
      setIsSubmitting(false);
      return;
    }
  
    try {
      const payload = {
        ...formData,
        purchasePrice: parseFloat(formData.purchasePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        portions: formData.portions ? parseInt(formData.portions) : undefined,
        portionPrice: formData.hasPortionPrice ? parseFloat(formData.portionPrice) : undefined,
        clubId: activeClub,
      };
      // Eliminar campos auxiliares
      delete (payload as { hasPortionPrice?: boolean }).hasPortionPrice;
      delete (payload as { hasPortionSize?: boolean }).hasPortionSize;
      
      if (initialData?._id) {
        await api.put(`/products/${initialData._id}`, payload);
      } else {
        await api.post("/products", payload);
      }
      onSubmit(payload);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: (err as any)?.response?.data?.message || "Error al guardar",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getStepDescription = () => {
    switch (step) {
      case 1:
        return "Selecciona el tipo de producto";
      case 2:
        return "Ingresa los datos básicos";
      case 3:
        return "Completa la información de precios y preparación";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmitForm}>
      <Card className="w-full max-w-2xl mx-auto shadow-xl bg-gradient-to-b from-background to-background/90 backdrop-blur-xl border border-primary/10 rounded-xl">
        <CardHeader className="border-b border-primary/10 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              {initialData ? <Save className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-2xl">
                {initialData ? "Editar Producto" : "Nuevo Producto"}
              </CardTitle>
              <CardDescription>
                {getStepDescription()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="w-full flex items-center">
              <div className={`h-2 rounded-full flex-grow ${step >= 1 ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
              <div className={`h-2 rounded-full flex-grow ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
              <div className={`h-2 rounded-full flex-grow ${step >= 3 ? "bg-primary" : "bg-muted"}`}></div>
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>3</div>
              <div className={`h-2 rounded-full flex-grow bg-muted`}></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {step === 1 && (
            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Label>Tipo de Producto</Label>
                  {renderHelpIcon("Define cómo se comercializará y usará el producto dentro del sistema.")}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      value: "sealed",
                      label: "Sellado",
                      icon: Package,
                      description: "Unidades completas para venta directa",
                    },
                    {
                      value: "prepared",
                      label: "Preparado",
                      icon: Coffee,
                      description: "Insumos para preparaciones",
                    },
                    {
                      value: "both",
                      label: "Ambos",
                      icon: Package,
                      description: "Disponible para venta directa y preparaciones",
                    },
                  ].map((type) => (
                    <div
                      key={type.value}
                      className={`relative p-5 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        formData.type === type.value
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/30"
                      }`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-3 rounded-full ${formData.type === type.value ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <type.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {type.description}
                          </p>
                        </div>
                        {formData.type === type.value && (
                          <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-primary animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.type && (
                  <div className="flex items-center text-sm text-destructive gap-1 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <p>{errors.type}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="name" className="flex items-center">
                      <ShoppingCart className="h-4 w-4 mr-2" /> Nombre del Producto
                    </Label>
                    {renderHelpIcon("Nombre completo del producto como aparecerá en catálogos")}
                  </div>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={errors.name ? "border-destructive" : ""}
                    placeholder="Ej: Proteína Whey Premium"
                  />
                  {errors.name && (
                    <div className="flex items-center text-sm text-destructive gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <p>{errors.name}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="flavor" className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" /> Sabor (opcional)
                    </Label>
                    {renderHelpIcon("Sabor distintivo del producto si aplica (ej: vainilla, chocolate, etc.)")}
                  </div>
                  <Input
                    id="flavor"
                    value={formData.flavor}
                    onChange={(e) => 
                      setFormData({ ...formData, flavor: e.target.value })
                    }
                    placeholder="Ej: Vainilla, Chocolate, Fresa"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="brand" className="flex items-center">
                      <Tag className="h-4 w-4 mr-2" /> Marca (opcional)
                    </Label>
                    {renderHelpIcon("Fabricante o marca comercial del producto")}
                  </div>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    className={errors.brand ? "border-destructive" : ""}
                    placeholder="Ej: PowerNutrition"
                  />
                  {errors.brand && (
                    <div className="flex items-center text-sm text-destructive gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <p>{errors.brand}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="category" className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" /> Categoría
                  </Label>
                  {renderHelpIcon("Agrupa productos similares para facilitar búsquedas y reportes")}
                </div>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger
                    className={errors.category ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proteins">Proteínas</SelectItem>
                    <SelectItem value="vitamins">Vitaminas</SelectItem>
                    <SelectItem value="supplements">Suplementos</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <div className="flex items-center text-sm text-destructive gap-1">
                    <AlertCircle className="h-4 w-4" />
                    <p>{errors.category}</p>
                  </div>
                )}
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Arrastra una imagen aquí</p>
                    <p className="text-sm text-muted-foreground">
                      o haz clic para seleccionar (PNG, JPG, máx 5MB)
                    </p>
                  </div>
                </div>
                <input type="file" className="hidden" accept="image/*" />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              {/* Sección para Precio de Compra - Visible para todos los tipos de producto */}
              <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-blue-50/30 dark:bg-blue-950/10">
                <h3 className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-300">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Información de Costos
                  {renderHelpIcon("Información sobre los costos del producto")}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="purchasePrice" className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" /> Precio de Compra
                    </Label>
                    {renderHelpIcon("Lo que te cuesta a ti adquirir este producto de tu proveedor")}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, purchasePrice: e.target.value })
                      }
                      className={`pl-7 ${errors.purchasePrice ? "border-destructive" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.purchasePrice && (
                    <div className="flex items-center text-sm text-destructive gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <p>{errors.purchasePrice}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección para Producto Sellado - Visible solo para tipos "sealed" y "both" */}
              {(formData.type === "sealed" || formData.type === "both") && (
                <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-blue-50/30 dark:bg-blue-950/10">
                  <h3 className="text-sm font-medium flex items-center text-blue-700 dark:text-blue-300">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Información de Producto Sellado
                    {renderHelpIcon("Esta información aplica al producto en su envase original, para venta directa sin preparación")}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="salePrice" className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" /> Precio de Venta
                      </Label>
                      {renderHelpIcon("Precio al que venderás el producto completo, sin preparación")}
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                      <Input
                        id="salePrice"
                        type="number"
                        value={formData.salePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, salePrice: e.target.value })
                        }
                        className={`pl-7 ${errors.salePrice ? "border-destructive" : ""}`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.salePrice && (
                      <div className="flex items-center text-sm text-destructive gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <p>{errors.salePrice}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sección para Producto Preparado - Visible solo para tipos "prepared" y "both" */}
              {(formData.type === "prepared" || formData.type === "both") && (
                <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-green-50/30 dark:bg-green-950/10">
                  <h3 className="text-sm font-medium flex items-center text-green-700 dark:text-green-300">
                    <Coffee className="h-4 w-4 mr-2" />
                    Información de Preparación
                    {renderHelpIcon("Esta información aplica cuando el producto se usa para preparar porciones individuales")}
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="portions" className="flex items-center">
                          Número de Porciones
                        </Label>
                        {renderHelpIcon("Cuántas porciones se pueden preparar con este producto")}
                      </div>
                      <Input
                        id="portions"
                        type="number"
                        value={formData.portions}
                        onChange={(e) =>
                          setFormData({ ...formData, portions: e.target.value })
                        }
                        className={errors.portions ? "border-destructive" : ""}
                        placeholder="Ej: 30"
                      />
                      {errors.portions && (
                        <div className="flex items-center text-sm text-destructive gap-1">
                          <AlertCircle className="h-4 w-4" />
                          <p>{errors.portions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="hasPortionSize"
                          checked={formData.hasPortionSize}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasPortionSize: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasPortionSize" className="flex items-center cursor-pointer">
                          Aplicar Tamaño de Porción
                        </Label>
                        {renderHelpIcon("Indica la cantidad por porción (gramos, ml, etc)")}
                      </div>
                      
                      <Input
                        id="portionSize"
                        placeholder="Ej: 25g"
                        value={formData.portionSize}
                        onChange={(e) =>
                          setFormData({ ...formData, portionSize: e.target.value })
                        }
                        disabled={!formData.hasPortionSize}
                        className={!formData.hasPortionSize ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" : ""}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-green-100 dark:border-green-900/30 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="hasPortionPrice"
                          checked={formData.hasPortionPrice}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, hasPortionPrice: checked as boolean })
                          }
                        />
                        <Label htmlFor="hasPortionPrice" className="flex items-center cursor-pointer">
                          Aplicar Precio por Porción
                        </Label>
                        {renderHelpIcon("Cuánto cobrarás por cada porción individual preparada")}
                      </div>
                      
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <Input
                          id="portionPrice"
                          type="number"
                          placeholder="0.00"
                          value={formData.portionPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, portionPrice: e.target.value })
                          }
                          disabled={!formData.hasPortionPrice}
                          className={`pl-7 ${!formData.hasPortionPrice ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500" : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-primary/10 p-4 bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-full sm:w-auto flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Regresar
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Cancelar
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext();
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 flex items-center gap-2 justify-center"
                >
                  Siguiente <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary hover:to-purple-700 flex items-center gap-2 justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Finalizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Guardar Producto
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}