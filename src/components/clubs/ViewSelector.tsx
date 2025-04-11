import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewSelectorProps {
  view: "grid" | "table";
  onChange: (view: "grid" | "table") => void;
}

export function ViewSelector({ view, onChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Button
        variant={view === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("grid")}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant={view === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("table")}
        className="gap-2"
      >
        <List className="h-4 w-4" />
        Tabla
      </Button>
    </div>
  );
}