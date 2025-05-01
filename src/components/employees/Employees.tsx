import { Construction } from "lucide-react";

export default function Employees() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/50 to-blue-50/50 dark:from-background dark:via-purple-950/5 dark:to-blue-950/5 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-4">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Sección en Desarrollo</h1>
          <p className="text-muted-foreground max-w-md">
            Estamos trabajando para mejorar la gestión de empleados. Esta sección estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  );
}

