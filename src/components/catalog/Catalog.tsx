import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./ProductCard";
import { ProductForm } from "./ProductForm";
import { Plus, Search, Filter, Option } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { useClub } from "@/context/ClubContext";


export function Catalog() {
  const { activeClub } = useClub();
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();



  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        if (activeClub) {
          const response = await api.get(`/products/club/${activeClub}`);
          setProducts(response.data);
        }
      } catch (err) {
        setError("Error al cargar los productos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeClub]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleArchive = async (id: string) => {
    try {
      await api.patch(`/products/${id}/archive`);
      setProducts(products.filter(product => product._id !== id));
      toast({
        title: "Producto archivado",
        description: "El producto ha sido archivado exitosamente",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo archivar el producto",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    console.log("handleSubmit ejecutado desde Catalog");
    try {
      // Actualizar la lista de productos (la API ya se llamó en ProductForm)
      const response = await api.get(`/products/club/${activeClub}`);
      setProducts(response.data);
      toast({
        title: editingProduct ? "Producto actualizado" : "Producto creado",
        description: "Los cambios se han guardado correctamente",
      });
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: (error as any)?.response?.data?.message || "Error al guardar",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    if (product.archived) return false;
    
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    
    const matchesType = filterType === "all" || 
                       (filterType === "sealed" && (product.type === "sealed" || product.type === "both")) ||
                       (filterType === "prepared" && (product.type === "prepared" || product.type === "both")) ||
                       filterType === product.type;
    
    return matchesSearch && matchesType && matchesCategory;
  });

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
    <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted/10 transition-colors duration-500">
      <div className="container mx-auto px-4 py-8 md:p-8 space-y-8">
        {/* Header con Logo */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <Option className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Catálogo de Productos</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Mi Catálogo
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos de manera eficiente
          </p>
        </div>

        {showForm ? (
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            initialData={editingProduct}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <Button 
                onClick={() => setShowForm(true)} 
                className="md:w-auto w-full bg-gradient-to-r from-primary/90 to-purple-600 hover:from-primary hover:to-purple-700 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background/50 backdrop-blur-sm border-muted"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px] bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="sealed">Sellados</SelectItem>
                    <SelectItem value="prepared">Preparados</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full md:w-[180px] bg-background/50 backdrop-blur-sm">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="proteins">Proteínas</SelectItem>
                    <SelectItem value="vitamins">Vitaminas</SelectItem>
                    <SelectItem value="supplements">Suplementos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={() => handleEdit(product)}
                  onArchive={() => handleArchive(product._id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron productos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}