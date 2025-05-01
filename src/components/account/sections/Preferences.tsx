import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export function Preferences() {
  return (
    <div className="h-[50vh] flex items-center justify-center">
      <Card className="border-none shadow-xl bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-semibold">Próximamente</h3>
            <p className="text-muted-foreground">
              Estamos trabajando en las preferencias de la aplicación. 
              Pronto podrás personalizar tu experiencia.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}