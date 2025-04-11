import { useEffect, useState, ChangeEvent } from "react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { Camera } from "lucide-react";

interface NuevoClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (club: any) => void;
  onSuccess?: () => void; // Añade esta nueva prop
}

export function NewClubModal({ open, onOpenChange, onCreated, onSuccess }: NuevoClubModalProps) {
  const [allowed, setAllowed] = useState<boolean|null>(null);
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: "", address: "",
    contact: { phone: "", email: "" },
    paymentMethods: [] as ("cash"|"card"|"transfer")[],
    schedule: {
      monday: { closed: false, ranges: [{ open:"09:00",close:"18:00"}] },
      tuesday: { closed: false, ranges: [{ open:"09:00",close:"18:00"}] },
      wednesday: { closed: false, ranges: [{ open:"09:00",close:"18:00"}] },
      thursday: { closed: false, ranges: [{ open:"09:00",close:"18:00"}] },
      friday: { closed: false, ranges: [{ open:"09:00",close:"18:00"}] },
      saturday: { closed: false, ranges: [{ open:"10:00",close:"16:00"}] },
      sunday: { closed: false, ranges: [{ open:"10:00",close:"16:00"}] },
    }
  });
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [preview, setPreview] = useState<string|null>(null);

  // Al abrir modal: consultar permiso
  useEffect(() => {
    if (!open) return;
    api.get("/clubs/me")
      .then(res => {
        const user = res.data;
        const current = (user.clubs || []).length;
        const max = user.suscripcion.clubsMax + (user.suscripcion.tiendasExtra || 0);
        if (current < max) {
          setAllowed(true);
        } else {
          setAllowed(false);
          setMessage("Tu suscripción no te permite agregar más clubes. Mejora tu plan o contáctanos para uno personalizado.");
        }
      })
      .catch(() => {
        setAllowed(false);
        setMessage("No se pudo verificar tu suscripción.");
      });
  }, [open]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setImageFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("address", formData.address);
    fd.append("contact", JSON.stringify(formData.contact));
    fd.append("schedule", JSON.stringify(formData.schedule));
    fd.append("paymentMethods", JSON.stringify(formData.paymentMethods));
    if (imageFile) fd.append("image", imageFile);

    try {
      const res = await api.post("/clubs", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onCreated?.(res.data.club);
      onOpenChange(false);
      onSuccess?.(); // Llama a la función de actualización
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-2xl font-bold">Crear Nuevo Club</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {allowed === false ? message : "Completa los datos para crear tu club"}
          </DialogDescription>
        </DialogHeader>

        {allowed === false ? (
          <div className="p-6 space-y-4">
            <Button variant="outline" onClick={() => window.location.href="/plans"}>
              Ver Planes
            </Button>
          </div>
        ) : allowed === true ? (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Imagen */}
            <div className="relative h-40 bg-gray-100 mx-6 rounded-lg overflow-hidden">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Camera size={32}/>
                </div>
              )}
              <label className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow cursor-pointer">
                <Input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                <Camera size={16}/>
              </label>
            </div>

            <div className="p-6 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="advanced">Avanzado</TabsTrigger>
                </TabsList>

                {/* General */}
                <TabsContent value="general" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Nombre del Club</Label>
                      <Input
                        value={formData.name}
                        onChange={e=>setFormData({...formData,name:e.target.value})}
                        placeholder="Tu club"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-medium">Dirección</Label>
                      <Input
                        value={formData.address}
                        onChange={e=>setFormData({...formData,address:e.target.value})}
                        placeholder="Dirección completa"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-medium">Teléfono</Label>
                      <Input
                        value={formData.contact.phone}
                        onChange={e=>setFormData({
                          ...formData,
                          contact:{...formData.contact,phone:e.target.value}
                        })}
                        placeholder="+52 123 456 7890"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <Input
                        type="email"
                        value={formData.contact.email}
                        onChange={e=>setFormData({
                          ...formData,
                          contact:{...formData.contact,email:e.target.value}
                        })}
                        placeholder="club@ejemplo.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Avanzado */}
                <TabsContent value="advanced" className="space-y-4">
                  <h4 className="font-semibold">Métodos de Pago</h4>
                  <div className="flex flex-wrap gap-2">
                    {(["cash","card","transfer"] as const).map(m=>(
                      <label key={m} className={`flex items-center space-x-2 px-3 py-2 border rounded-lg cursor-pointer
                        ${formData.paymentMethods.includes(m)
                          ? "bg-blue-50 border-blue-300"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}>
                        <Checkbox
                          checked={formData.paymentMethods.includes(m)}
                          onCheckedChange={c=>setFormData({
                            ...formData,
                            paymentMethods: c
                              ? [...formData.paymentMethods,m]
                              : formData.paymentMethods.filter(x=>x!==m)
                          })}
                        />
                        <span className="capitalize">{m==="cash"?"Efectivo":m==="card"?"Tarjeta":"Transferencia"}</span>
                      </label>
                    ))}
                  </div>
                  <h4 className="font-semibold">Horario de Operación</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(formData.schedule).map(([day, obj])=>(
                      <div key={day} className="border rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <Checkbox
                            checked={obj.closed}
                            onCheckedChange={c=>setFormData({
                              ...formData,
                              schedule:{
                                ...formData.schedule,
                                [day]:{...obj,closed:c}
                              }
                            })}
                          />
                          <Label className="ml-2 capitalize">{day} cerrado</Label>
                        </div>
                        {!obj.closed && obj.ranges.map((r,i)=>(
                          <div key={i} className="flex items-center space-x-2 mb-2">
                            <Input
                              type="time"
                              value={r.open}
                              onChange={e=>{
                                const newRanges = [...obj.ranges];
                                newRanges[i].open = e.target.value;
                                setFormData({
                                  ...formData,
                                  schedule:{...formData.schedule,[day]:{...obj,ranges:newRanges}}
                                });
                              }}
                              className="w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={r.close}
                              onChange={e=>{
                                const newRanges = [...obj.ranges];
                                newRanges[i].close = e.target.value;
                                setFormData({
                                  ...formData,
                                  schedule:{...formData.schedule,[day]:{...obj,ranges:newRanges}}
                                });
                              }}
                              className="w-24"
                            />
                          </div>
                        ))}
                        {!obj.closed && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={()=>{
                              setFormData({
                                ...formData,
                                schedule:{
                                  ...formData.schedule,
                                  [day]:{...obj,ranges:[...obj.ranges,{open:"00:00",close:"00:00"}]}
                                }
                              });
                            }}
                          >+ Rango</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="flex justify-end space-x-3 bg-gray-50 p-4">
              <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Crear Club</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="p-6 text-center">Cargando...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
