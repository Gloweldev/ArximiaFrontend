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
import { Club } from "../types";
import api from "@/services/api";
import { Camera } from "lucide-react";

interface EditClubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club | null;
  onSave?: (club: Club) => void;
}

export function EditClubModal({ open, onOpenChange, club, onSave }: EditClubProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<(Omit<Club, "paymentMethods"> & { paymentMethods: ("cash" | "card" | "transfer")[] }) | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (club) {
      const defaultSchedule = {
        monday: { closed: false, ranges: [] },
        tuesday: { closed: false, ranges: [] },
        wednesday: { closed: false, ranges: [] },
        thursday: { closed: false, ranges: [] },
        friday: { closed: false, ranges: [] },
        saturday: { closed: false, ranges: [] },
        sunday: { closed: false, ranges: [] },
      };

      const schedule = { ...defaultSchedule };
      for (const day in club.schedule) {
        if (club.schedule[day]) {
          schedule[day] = {
            closed: club.schedule[day].closed || false,
            ranges: Array.isArray(club.schedule[day].ranges) ? club.schedule[day].ranges : [],
          };
        }
      }

      setFormData({
        ...club,
        schedule,
        paymentMethods: club.paymentMethods || [],
        contact: club.contact || { phone: "", email: "" },
      });
      
      setPreviewImage(club.image || null);
    }
  }, [club]);

  if (!formData) return null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("address", formData.address);
      fd.append("contact", JSON.stringify(formData.contact));
      fd.append("schedule", JSON.stringify(formData.schedule));
      fd.append("paymentMethods", JSON.stringify(formData.paymentMethods));
      if (imageFile) fd.append("image", imageFile);

      const res = await api.put(`/clubs/${formData.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSave?.(res.data.club);
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
    onOpenChange(false);
  };

  const formatDayName = (day: string) => {
    const dayNames: Record<string, string> = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };
    return dayNames[day] || day;
  };

  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const weekend = ["saturday", "sunday"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-h-[90vh] overflow-y-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0 sticky top-0 bg-white z-10">
          <DialogTitle className="text-xl sm:text-2xl font-bold">Editar Club</DialogTitle>
          <DialogDescription className="text-sm">
            Actualiza la información de tu club para mantener a tus clientes informados.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="relative h-32 sm:h-48 md:h-56 bg-gray-100 mt-4 sm:mt-6 mx-4 sm:mx-6 rounded-lg overflow-hidden">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Club"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <Camera size={36} className="mb-2" />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
            <label className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <Camera size={16} className="text-gray-700" />
            </label>
          </div>
  
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4 sm:mb-6">
                <TabsTrigger value="general" className="text-xs sm:text-sm">Información General</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs sm:text-sm">Configuración Avanzada</TabsTrigger>
              </TabsList>
  
              <TabsContent value="general" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-md sm:text-lg font-semibold text-gray-800">Información Básica</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Nombre del Club</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                          placeholder="Nombre de tu club"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="text-sm font-medium">Dirección</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={e => setFormData({ ...formData, address: e.target.value })}
                          className="mt-1"
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-md sm:text-lg font-semibold text-gray-800">Contacto</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Teléfono</Label>
                        <Input
                          id="phone"
                          value={formData.contact.phone}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, phone: e.target.value },
                            })
                          }
                          className="mt-1"
                          placeholder="+52 (123) 456-7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.contact.email}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              contact: { ...formData.contact, email: e.target.value },
                            })
                          }
                          className="mt-1"
                          placeholder="club@ejemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-3">Métodos de Pago</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {(["cash", "card", "transfer"] as const).map((method: "cash" | "card" | "transfer") => (
                      <label
                        key={method}
                        className={`flex items-center space-x-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors
                          ${formData.paymentMethods.includes(method)
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        <Checkbox
                          id={method}
                          checked={formData.paymentMethods.includes(method)}
                          onCheckedChange={checked =>
                            setFormData({
                              ...formData,
                              paymentMethods: checked
                                ? [...formData.paymentMethods, method]
                                : formData.paymentMethods.filter(m => m !== method),
                            })
                          }
                        />
                        <span className="capitalize">
                          {method === "cash"
                            ? "Efectivo"
                            : method === "card"
                            ? "Tarjeta"
                            : "Transferencia"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </TabsContent>
  
              <TabsContent value="advanced" className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Horario de Operación</h3>
                  
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm font-medium mb-2 sm:mb-3 text-gray-700">Entre Semana</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {weekdays.map((day) => (
                        <div key={day} className="border rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex items-center mb-2">
                            <Checkbox
                              id={`${day}-closed`}
                              checked={formData.schedule[day].closed}
                              onCheckedChange={checked =>
                                setFormData({
                                  ...formData,
                                  schedule: {
                                    ...formData.schedule,
                                    [day]: { ...formData.schedule[day], closed: checked },
                                  },
                                })
                              }
                            />
                            <Label htmlFor={`${day}-closed`} className="ml-2 text-sm">{formatDayName(day)} - Cerrado</Label>
                          </div>
                          {!formData.schedule[day].closed && (
                            <div className="space-y-2">
                              {formData.schedule[day].ranges.map((range, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <Input
                                    type="time"
                                    value={range.open}
                                    onChange={e =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.map((r, i) =>
                                              i === index ? { ...r, open: e.target.value } : r
                                            ),
                                          },
                                        },
                                      })
                                    }
                                    className="w-24"
                                  />
                                  <span>-</span>
                                  <Input
                                    type="time"
                                    value={range.close}
                                    onChange={e =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.map((r, i) =>
                                              i === index ? { ...r, close: e.target.value } : r
                                            ),
                                          },
                                        },
                                      })
                                    }
                                    className="w-24"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.filter((_, i) => i !== index),
                                          },
                                        },
                                      })
                                    }
                                  >
                                    X
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    schedule: {
                                      ...formData.schedule,
                                      [day]: {
                                        ...formData.schedule[day],
                                        ranges: [...formData.schedule[day].ranges, { open: "00:00", close: "00:00" }],
                                      },
                                    },
                                  })
                                }
                              >
                                + Rango
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2 sm:mb-3 text-gray-700">Fin de Semana</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {weekend.map((day) => (
                        <div key={day} className="border rounded-lg p-3 bg-white shadow-sm">
                          <div className="flex items-center mb-2">
                            <Checkbox
                              id={`${day}-closed`}
                              checked={formData.schedule[day].closed}
                              onCheckedChange={checked =>
                                setFormData({
                                  ...formData,
                                  schedule: {
                                    ...formData.schedule,
                                    [day]: { ...formData.schedule[day], closed: checked },
                                  },
                                })
                              }
                            />
                            <Label htmlFor={`${day}-closed`} className="ml-2 text-sm">{formatDayName(day)} - Cerrado</Label>
                          </div>
                          {!formData.schedule[day].closed && (
                            <div className="space-y-2">
                              {formData.schedule[day].ranges.map((range, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <Input
                                    type="time"
                                    value={range.open}
                                    onChange={e =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.map((r, i) =>
                                              i === index ? { ...r, open: e.target.value } : r
                                            ),
                                          },
                                        },
                                      })
                                    }
                                    className="w-24"
                                  />
                                  <span>-</span>
                                  <Input
                                    type="time"
                                    value={range.close}
                                    onChange={e =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.map((r, i) =>
                                              i === index ? { ...r, close: e.target.value } : r
                                            ),
                                          },
                                        },
                                      })
                                    }
                                    className="w-24"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setFormData({
                                        ...formData,
                                        schedule: {
                                          ...formData.schedule,
                                          [day]: {
                                            ...formData.schedule[day],
                                            ranges: formData.schedule[day].ranges.filter((_, i) => i !== index),
                                          },
                                        },
                                      })
                                    }
                                  >
                                    X
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    schedule: {
                                      ...formData.schedule,
                                      [day]: {
                                        ...formData.schedule[day],
                                        ranges: [...formData.schedule[day].ranges, { open: "00:00", close: "00:00" }],
                                      },
                                    },
                                  })
                                }
                              >
                                + Rango
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
  
          <DialogFooter className="flex justify-end space-x-2 sm:space-x-3 bg-gray-50 p-3 sm:p-4 border-t sticky bottom-0 z-10">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="px-3 sm:px-4 text-sm"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="px-3 sm:px-4 text-sm"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}