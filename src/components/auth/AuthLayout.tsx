import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Option as Nutrition } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-3">
              <Nutrition className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h1 className={cn(
            "text-2xl font-semibold tracking-tight",
            subtitle ? "mb-2" : "mb-0"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {children}
      </Card>
    </div>
  );
}