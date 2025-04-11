import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Package, Coffee, DollarSign, User, Plus, Edit, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ClientSelector from '@/components/clients/ClientSelector';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/context/ClubContext';
import api from '@/services/api';

// Types for the component
export interface Product {
  portionPrice: number;
  id: string;
  name: string;
  type: 'sealed' | 'prepared' | 'both';
  price: number;
  stock: number;
  portions?: number;
}

export interface Client {
  _id: string;
  id: string;
  name: string;
  type: 'occasional' | 'regular' | 'wholesale';
  phone?: string;
  total_spent: number;
  last_purchase?: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  type: 'sealed' | 'prepared';
  portions?: number;
  pricePerPortion?: number;
  custom_price: boolean;
}

export interface ItemGroup {
  id: string;
  name: string;
  items: SaleItem[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
}

export function NewSaleModal({ open, onOpenChange, onSave }: Props) {
  const { activeClub } = useClub();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Step state
  const [step, setStep] = useState(1);
  // Product loading states
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  // Sale group states
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([{ id: 'g1', name: 'Grupo 1', items: [] }]);
  // Selected client state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  // Group editing state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  // Currently adding to group
  const [activeGroupId, setActiveGroupId] = useState<string>('g1');

  // States for type selection and portions for "both" or "prepared" products
  const [showTypeSelector, setShowTypeSelector] = useState<{ show: boolean; product: Product | null }>({ show: false, product: null });
  const [portionsInput, setPortionsInput] = useState<{ show: boolean; product: Product | null; portions: number; pricePerPortion: number }>({
    show: false,
    product: null,
    portions: 0,
    pricePerPortion: 0,
  });

  // Load products of active club when opening modal
  useEffect(() => {
    if (open && activeClub) {
      loadProducts();
    }
  }, [open, activeClub]);

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSearchTerm('');
      setItemGroups([{ id: 'g1', name: 'Grupo 1', items: [] }]);
      setSelectedClient(null);
      setEditingGroupId(null);
      setActiveGroupId('g1');
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/search/sales?clubId=${activeClub}&query=${searchTerm}`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Error loading products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    if (product.type === 'both') {
      setShowTypeSelector({ show: true, product });
    } else if (product.type === 'prepared') {
      // For prepared products, request portion configuration
      setPortionsInput({ show: true, product, portions: 1, pricePerPortion: product.portionPrice });
    } else {
      addItem(product, 'sealed');
    }
  };

  // Function to add an item to the current group
  const addItem = (
    product: Product,
    type: 'sealed' | 'prepared',
    portions?: number,
    pricePerPortion?: number
  ) => {
    const newItem: SaleItem = {
      id: crypto.randomUUID(),
      product_id: product.id,
      quantity: type === 'prepared' ? (portions || 1) : 1,
      unit_price: type === 'prepared' && pricePerPortion ? pricePerPortion : product.price,
      type,
      custom_price: false,
      ...(type === 'prepared' && portions && pricePerPortion
        ? { portions, pricePerPortion }
        : {}),
    };
    setItemGroups(prev =>
      prev.map(group =>
        group.id === activeGroupId
          ? { ...group, items: [...group.items, newItem] }
          : group
      )
    );
    // Clear auxiliary states
    setShowTypeSelector({ show: false, product: null });
    setPortionsInput({ show: false, product: null, portions: 0, pricePerPortion: 0 });
  };

  const addNewGroup = () => {
    const newGroupId = crypto.randomUUID();
    setItemGroups(prev => [
      ...prev,
      { id: newGroupId, name: `Grupo ${prev.length + 1}`, items: [] }
    ]);
    setActiveGroupId(newGroupId);
  };

  const startEditGroupName = (groupId: string) => {
    setEditingGroupId(groupId);
  };

  const updateGroupName = (groupId: string, newName: string) => {
    setItemGroups(prev =>
      prev.map(group =>
        group.id === groupId ? { ...group, name: newName } : group
      )
    );
  };

  const finishEditGroupName = () => {
    setEditingGroupId(null);
  };

  const removeGroup = (groupId: string) => {
    if (itemGroups.length > 1) {
      setItemGroups(prev => prev.filter(group => group.id !== groupId));
      // Set active group to the first one if removing the active one
      if (activeGroupId === groupId) {
        setActiveGroupId(itemGroups.filter(g => g.id !== groupId)[0]?.id || '');
      }
    }
  };

  const removeItem = (groupId: string, itemId: string) => {
    setItemGroups(prev =>
      prev.map(group =>
        group.id === groupId ? { ...group, items: group.items.filter(item => item.id !== itemId) } : group
      )
    );
  };

  const updateItemQuantity = (groupId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(groupId, itemId);
      return;
    }
    setItemGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, items: group.items.map(item => item.id === itemId ? { ...item, quantity } : item) }
          : group
      )
    );
  };

  const updateItemPrice = (groupId: string, itemId: string, price: number) => {
    if (price <= 0) return;
    setItemGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? { ...group, items: group.items.map(item => item.id === itemId ? { ...item, unit_price: price, custom_price: true } : item) }
          : group
      )
    );
  };

  const total = itemGroups.reduce(
    (sum, group) =>
      sum + group.items.reduce((s, item) => s + item.quantity * item.unit_price, 0),
    0
  );

  const handleNext = () => {
    const hasItems = itemGroups.some(group => group.items.length > 0);
    if (!hasItems) {
      toast({
        title: "Error",
        description: "Add at least one product",
        variant: "destructive"
      });
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const saleData = {
        itemGroups,
        total,
        client_id: selectedClient ? (selectedClient._id || selectedClient.id) : null,
        clubId: activeClub,
      };
      await api.post('/sales', saleData);
      toast({
        title: "Success",
        description: "Sale registered successfully",
        variant: "default"
      });
      onOpenChange(false);
      if (onSave) onSave();
    } catch (error) {
      console.error('Error registering sale:', error);
      toast({
        title: "Error",
        description: "Error registering sale",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Render type selector for "both" products
  const renderTypeSelector = () => {
    if (!showTypeSelector.show || !showTypeSelector.product) return null;
    const remainingPortions = showTypeSelector.product.type === 'both'
      ? showTypeSelector.product.stock * 20 // Example: 20 portions per unit
      : showTypeSelector.product.stock;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">¿Cómo deseas vender este producto?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              className="p-4 border rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
              onClick={() => addItem(showTypeSelector.product!, 'sealed')}
            >
              <Package className="h-8 w-8 text-blue-500" />
              <span className="font-medium">Producto Sellado</span>
              <span className="text-sm text-gray-500">Stock: {showTypeSelector.product.stock} unidades</span>
              <span className="font-medium text-primary">${showTypeSelector.product.price}</span>
            </button>
            <button
              className="p-4 border rounded-lg hover:bg-gray-100 transition-colors flex flex-col items-center gap-2"
              onClick={() => {
                setPortionsInput({
                  show: true,
                  product: showTypeSelector.product,
                  portions: 1,
                  pricePerPortion: showTypeSelector.product?.portionPrice || 0,
                });
                setShowTypeSelector({ show: false, product: null });
              }}
            >
              <Coffee className="h-8 w-8 text-green-500" />
              <span className="font-medium">Para Preparación</span>
              <span className="text-sm text-gray-500">
                Porciones: {showTypeSelector.product?.portions || 'N/A'}
              </span>
            </button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowTypeSelector({ show: false, product: null })}
              className="text-red-500"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Render portions input
  const renderPortionsInput = () => {
    if (!portionsInput.show || !portionsInput.product) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">Configurar Preparación</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Porciones</label>
              <Input
                type="number"
                min="1"
                value={portionsInput.portions}
                onChange={(e) =>
                  setPortionsInput({
                    ...portionsInput,
                    portions: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio por Porción</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                  type="number"
                  step="0.01"
                  value={portionsInput.pricePerPortion || ''}
                  onChange={(e) =>
                    setPortionsInput({
                    ...portionsInput,
                    pricePerPortion: e.target.value === '' ? 0 : parseFloat(e.target.value),
                    })
                  }
                  onBlur={() => {
                    if (!portionsInput.pricePerPortion || portionsInput.pricePerPortion <= 0) {
                    toast({
                      title: "Error",
                      description: "El precio por porción es obligatorio y debe ser mayor a 0",
                      variant: "destructive",
                    });
                    }
                  }}
                  className="w-full pl-10 rounded-lg border px-3 py-2"
                  placeholder={portionsInput.product?.portionPrice?.toString() || ''}
                  required
                  />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setPortionsInput({ show: false, product: null, portions: 0, pricePerPortion: 0 })
                }
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (portionsInput.portions <= 0) {
                    toast({
                      title: "Error",
                      description: "Enter a valid number of portions",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (portionsInput.pricePerPortion <= 0) {
                    toast({
                      title: "Error",
                      description: "Enter a valid price per portion",
                      variant: "destructive"
                    });
                    return;
                  }
                  addItem(
                    portionsInput.product!,
                    'prepared',
                    portionsInput.portions,
                    portionsInput.pricePerPortion
                  );
                }}
                className="bg-primary text-white hover:bg-primary/90 transition-colors px-4 py-2 rounded-lg"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render product card component for each product
  function renderProductCard(product: Product): JSX.Element {
    const stockInfo =
      product.type === 'prepared'
        ? `${product.portions} porciones disponibles`
        : product.type === 'sealed'
        ? `${product.stock} unidades en stock`
        : `${product.stock} unidades (${product.portions} porciones)`;
    return (
      <div
        key={product.id}
        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleProductSelect(product)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {product.type === 'sealed' ? (
                <Package className="h-6 w-6 text-blue-500" />
              ) : product.type === 'prepared' ? (
                <Coffee className="h-6 w-6 text-green-500" />
              ) : (
                <div className="relative">
                  <Package className="h-6 w-6 text-blue-500" />
                  <Coffee className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-500">{stockInfo}</p>
            </div>
          </div>
          <div className="text-right">
            {product.type !== 'prepared' && (
              <p className="font-medium">${product.price}</p>
            )}
            {product.type === 'prepared' && (
              <p className="font-medium">${product.portionPrice}/porción</p>
            )}
            <p className="text-xs text-gray-500">
              {product.type === 'sealed'
                ? 'Producto Sellado'
                : product.type === 'prepared'
                ? 'Para Preparación'
                : 'Producto Dual'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center overflow-y-auto p-4">
      <div ref={modalRef} className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{step === 1 ? 'Seleccionar Productos' : 'Confirmar Venta'}</h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-500 hover:text-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Total */}
        {itemGroups.some(group => group.items.length > 0) && (
          <div className="border-b p-4 bg-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total:</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {/* Content scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {step === 1 ? (
              <>
                {/* Group Selection Tabs */}
                {itemGroups.length > 0 && (
                  <div className="mb-4 overflow-x-auto">
                    <div className="flex space-x-2 mb-2">
                      {itemGroups.map(group => (
                        <button
                          key={group.id}
                          onClick={() => setActiveGroupId(group.id)}
                          className={`px-3 py-2 rounded-md text-sm whitespace-nowrap flex items-center gap-1 ${
                            activeGroupId === group.id 
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          <span>{group.name}</span>
                        </button>
                      ))}
                      <button
                        onClick={addNewGroup}
                        className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 flex items-center gap-1 whitespace-nowrap"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Grupo</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Product Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {filteredProducts.map(renderProductCard)}
                </div>
                
                {/* Group Items Display */}
                {itemGroups.map((group) => (
                  <div key={group.id} className={`border rounded-lg p-4 mb-4 ${activeGroupId === group.id ? 'border-primary bg-blue-50/30' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {editingGroupId === group.id ? (
                          <div className="flex items-center">
                            <Input
                              type="text"
                              value={group.name}
                              onChange={(e) => updateGroupName(group.id, e.target.value)}
                              className="text-base font-medium border rounded-md h-8 px-2"
                              autoFocus
                              onBlur={finishEditGroupName}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') finishEditGroupName();
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium">{group.name}</span>
                            <button
                              onClick={() => startEditGroupName(group.id)}
                              className="text-gray-500 hover:text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {activeGroupId !== group.id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setActiveGroupId(group.id)}
                            className="text-xs"
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Añadir aquí
                          </Button>
                        )}
                        {itemGroups.length > 1 && (
                          <button onClick={() => removeGroup(group.id)} className="text-red-600 hover:text-red-800">
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {group.items.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-40" />
                          <p>No hay productos en este grupo</p>
                          <p className="text-sm">Selecciona productos para añadir</p>
                        </div>
                      ) : (
                        group.items.map((item) => {
                          const product = products.find(p => p.id === item.product_id);
                          if (!product) return null;
                          return (
                            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                              <div className="flex items-center gap-3">
                                {item.type === 'sealed' ? (
                                  <Package className="h-5 w-5 text-blue-500 shrink-0" />
                                ) : (
                                  <Coffee className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {item.type === 'sealed' ? 'Producto Sellado' : 'Preparación'}
                                    {item.portions && ` (${item.portions} porciones a $${item.pricePerPortion} c/u)`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                          {item.type === 'prepared' ? 'Porciones:' : 'Cantidad:'}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {item.type === 'prepared'
                                            ? 'Número de porciones a preparar'
                                            : 'Número de unidades'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <div className="flex items-center">
                                    <button
                                      onClick={() => updateItemQuantity(group.id, item.id, item.quantity - 1)}
                                      className="p-1 rounded-full hover:bg-gray-200"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        updateItemQuantity(group.id, item.id, parseInt(e.target.value) || 1)
                                      }
                                      className="w-12 text-center border rounded p-1 bg-white"
                                    />
                                    <button
                                      onClick={() => updateItemQuantity(group.id, item.id, item.quantity + 1)}
                                      className="p-1 rounded-full hover:bg-gray-200"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-grow sm:flex-grow-0">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <span className="text-sm text-gray-500 whitespace-nowrap">Precio:</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          {item.type === 'prepared'
                                            ? 'Precio por porción'
                                            : 'Precio por unidad'}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.unit_price}
                                      onChange={(e) =>
                                        updateItemPrice(group.id, item.id, parseFloat(e.target.value) || 0)
                                      }
                                      className="w-20 border rounded p-1 bg-white"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeItem(group.id, item.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                      {group.items.length > 0 && (
                        <div className="flex justify-between items-center pt-2 text-sm font-medium">
                          <span>Subtotal {group.name}:</span>
                          <span>${group.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="space-y-6" ref={containerRef}>
                {selectedClient ? (
                  <div className="p-4 bg-gray-100 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                    <div className="font-medium">Cliente: {selectedClient.name}</div>
                      <div className="text-sm text-gray-500">
                      Total gastado: ${selectedClient.total_spent.toFixed(2)}
                      </div>
                    </div>
                    </div>
                    <button onClick={() => setSelectedClient(null)} className="text-sm text-primary hover:text-primary/80">
                    Cambiar
                    </button>
                  </div>
                  </div>
                ) : (
                  <ClientSelector
                  onSelectClient={setSelectedClient}
                  selectedClient={selectedClient}
                  containerRef={containerRef}
                  />
                )}
                </div>
                <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium mb-4">Resumen de Venta</h4>
                {itemGroups.map((group) => (
                  <div key={group.id} className="mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                  <h5 className="font-medium text-primary mb-2">{group.name}</h5>
                  <div className="space-y-2">
                    {group.items.map((item) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <div key={item.id} className="flex justify-between">
                      <div>
                        {product?.name} x {item.quantity}
                        {item.portions && ` (${item.portions} porciones a $${item.pricePerPortion} c/u)`}
                      </div>
                      <div>${(item.quantity * item.unit_price).toFixed(2)}</div>
                      </div>
                    );
                    })}
                    <div className="pt-2 flex justify-between text-sm font-medium">
                    <div>Subtotal {group.name}:</div>
                    <div>${group.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</div>
                    </div>
                  </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                  <div>Total</div>
                  <div>${total.toFixed(2)}</div>
                </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-100 flex justify-between mt-auto">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleNext} disabled={!itemGroups.some(group => group.items.length > 0)}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Atrás
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Procesando...' : 'Finalizar Venta'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overlays and Modals */}
      {renderTypeSelector()}
      {renderPortionsInput()}
    </div>
  );
}

export default NewSaleModal;