// components/clients/ClientSelector.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Plus, Loader2, Check } from 'lucide-react';
import { Client } from '../../types/clients';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useClub } from '@/context/ClubContext';

interface Props {
  onSelectClient: (client: Client | null) => void;
  selectedClient: Client | null;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function ClientSelector({ onSelectClient, selectedClient, containerRef }: Props) {
  const { activeClub } = useClub();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [quickClientForm, setQuickClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'occasional'
  });
  const [savingClient, setSavingClient] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    loadClients();
  }, [activeClub]);

  const loadClients = async () => {
    try {
      if (!activeClub) return;
      const res = await api.get('/clients', { params: { clubId: activeClub } });
      setClients(res.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddClient = async () => {
    if (!quickClientForm.name) {
      toast.error('El nombre es obligatorio');
      return;
    }
    setSavingClient(true);
    try {
      const res = await api.post('/clients', { ...quickClientForm, clubId: activeClub });
      const newClient: Client = res.data;
      setClients(prev => [...prev, newClient]);
      onSelectClient(newClient);
      setShowQuickAdd(false);
      toast.success('Cliente creado correctamente');
      setQuickClientForm({
        name: '',
        phone: '',
        email: '',
        type: 'occasional'
      });
    } catch (error) {
      toast.error('Error al crear el cliente');
    } finally {
      setSavingClient(false);
    }
  };

  const recommendedClients = searchTerm === '' ? clients.slice(0, 3) : [];
  const filteredClients = searchTerm !== ''
    ? clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'occasional': return 'Ocasional';
      case 'regular': return 'Regular';
      case 'wholesale': return 'Mayorista';
      default: return type;
    }
  };

  const getClientTypeColor = (type: string) => {
    switch (type) {
      case 'occasional': return 'bg-gray-100 text-gray-800';
      case 'regular': return 'bg-blue-100 text-blue-800';
      case 'wholesale': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar cliente por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setShowQuickAdd(false);
          }}
          className="pl-9"
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white rounded-lg border shadow-lg max-h-[300px] overflow-y-auto">
          <div className="p-4 space-y-4">
            <button
              onClick={() => {
                setShowQuickAdd(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-primary/5 transition-colors text-primary"
            >
              <Plus className="h-5 w-5" />
              <span>Agregar cliente rápido</span>
            </button>

            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Cargando clientes...</p>
              </div>
            ) : (
              <>
                {searchTerm === '' && recommendedClients.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Clientes Recomendados</h3>
                    <div className="space-y-1">
                      {recommendedClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            onSelectClient(client);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {client.phone || client.email}
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${getClientTypeColor(client.type)}`}>
                            {getClientTypeLabel(client.type)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchTerm !== '' && (
                  <div className="space-y-1">
                    {filteredClients.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No se encontraron clientes
                      </div>
                    ) : (
                      filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            onSelectClient(client);
                            setIsOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {client.phone || client.email}
                              </div>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${getClientTypeColor(client.type)}`}>
                            {getClientTypeLabel(client.type)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd} modal>
        <DialogContent className="z-50 max-w-sm">
          <DialogHeader>
            <DialogTitle>Agregar Cliente Rápido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={quickClientForm.name}
                onChange={(e) => setQuickClientForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={quickClientForm.phone}
                onChange={(e) => setQuickClientForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Teléfono"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={quickClientForm.email}
                onChange={(e) => setQuickClientForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo de cliente</Label>
              <Select
                value={quickClientForm.type}
                onValueChange={(value) => setQuickClientForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occasional">Ocasional</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuickAdd(false)}>
              Cancelar
            </Button>
            <Button onClick={handleQuickAddClient} disabled={savingClient}>
              {savingClient ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Cliente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}