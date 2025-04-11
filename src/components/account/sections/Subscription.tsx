import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Crown,
  Store,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Download,
  AlertTriangle,
  Loader2,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import api from "@/services/api"; // Asegúrate de que la ruta es la correcta

export function Subscription() {
  const [subscription, setSubscription] = useState<{
    plan: string;
    fechaExpiracion: string;
    clubsMax: number;
    empleadosMax: number;
    precio: number;
  } | null>(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);

  useEffect(() => {
    // Cargar la suscripción del usuario
    const fetchSubscription = async () => {
      try {
        const res = await api.get('/subscription/me');
        setSubscription(res.data);
      } catch (error) {
        if (error instanceof Error && 'response' in error && (error as any).response.status === 404) {
          // Manejar la situación en que no existe una suscripción aún.
          setNoSubscription(true);
          toast.info("Aún no tienes una suscripción activa. Selecciona un plan para comenzar.");
        } else {
          console.error("Error al cargar la suscripción:", error);
          toast.error("Error al cargar la suscripción");
        }
      }
    };

    // Cargar historial de pagos
    const fetchPayments = async () => {
      try {
        const res = await api.get('/subscription/payments');
        setPaymentHistory(res.data);
      } catch (error) {
        // Aquí también puedes detectar 404 (no hay historial) y actuar en consecuencia.
        if (error instanceof Error && 'response' in error && (error as any).response.status === 404) {
          setPaymentHistory([]);
        } else {
          console.error("Error al cargar historial de pagos:", error);
          toast.error("Error al cargar el historial de pagos");
        }
      }
    };

    fetchSubscription();
    fetchPayments();
  }, []);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      await api.post('/subscription/cancel');
      toast.success("Suscripción cancelada correctamente");
      setShowCancelDialog(false);
      // Actualizamos la información de la suscripción luego de cancelar
      const res = await api.get('/subscription/me');
      setSubscription(res.data);
    } catch (error) {
      console.error("Error al cancelar la suscripción:", error);
      toast.error("Error al cancelar la suscripción");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: any) => {
    try {
      const res = await api.get(`/subscription/invoice/${invoiceId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Descargando factura ${invoiceId}...`);
    } catch (error) {
      console.error("Error al descargar la factura:", error);
      toast.error("Error al descargar la factura");
    }
  };

  // Si no hay suscripción y no se encontró en el backend
  if (noSubscription) {
    return (
      <div className="grid gap-6">
        <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>No tienes una suscripción activa</CardTitle>
            <CardDescription>Selecciona un plan para comenzar tu prueba o suscribirte a un plan de pago.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/plans"}>
              Seleccionar Plan
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mientras se carga la suscripción (y no se ha determinado que no existe)
  if (!subscription) {
    return <div>Cargando suscripción...</div>;
  }

  return (
    <div className="grid gap-6">
      {/* Sección de Plan Actual */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Crown className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {subscription.plan === 'prueba'
                    ? 'Plan de Prueba'
                    : `Plan ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}`}
                </CardTitle>
                <CardDescription>
                  Tu suscripción actual
                </CardDescription>
              </div>
              <Badge 
                variant="secondary" 
                className={new Date(subscription.fechaExpiracion) < new Date() 
                  ? "bg-red-100 text-red-800" 
                  : "bg-green-100 text-green-800"
                }
              >
                {new Date(subscription.fechaExpiracion) < new Date() ? "Expirada" : "Activa"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Datos del plan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <Store className="h-6 w-6 text-primary mb-2" />
              <div className="font-medium">
                {subscription.clubsMax} Tienda{subscription.clubsMax > 1 && "s"}
              </div>
              <p className="text-sm text-muted-foreground">Máximo permitido</p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50">
              <Users className="h-6 w-6 text-primary mb-2" />
              <div className="font-medium">
                {subscription.empleadosMax} Empleado{subscription.empleadosMax > 1 && "s"}
              </div>
              <p className="text-sm text-muted-foreground">Por club</p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <div className="font-medium">
                {format(new Date(subscription.fechaExpiracion), "d 'de' MMMM, yyyy", { locale: es })}
              </div>
              <p className="text-sm text-muted-foreground">Renovación / Vencimiento</p>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50">
              <CreditCard className="h-6 w-6 text-primary mb-2" />
              <div className="font-medium">${subscription.precio}/mes</div>
              <p className="text-sm text-muted-foreground">Cargo mensual</p>
            </div>
          </div>

          {/* Acciones disponibles */}
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.plan === 'prueba' && (
              <Button className="flex-1" onClick={() => window.location.href = "/plans"}>
                Actualizar suscripción
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={() => setShowCancelDialog(true)}
              disabled={loading}
            >
              Cancelar suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>Registro de facturación y pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <TableRow key={payment.invoiceId}>
                    <TableCell className="font-medium">{payment.invoiceId}</TableCell>
                    <TableCell>
                      {format(new Date(payment.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {payment.status === 'paid' ? 'Pagado' : payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(payment.invoiceId)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No hay registros de pago
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para cancelar suscripción */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancelar Suscripción
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a las funciones premium al final del período actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mantener suscripción</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Sí, cancelar suscripción"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

