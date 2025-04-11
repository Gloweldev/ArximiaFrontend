import { Package, Coffee, ArrowUp, ArrowDown, History } from "lucide-react";
import { ProductType } from "./types";

export const getTypeIcon = (type: ProductType) => {
  switch (type) {
    case "sealed":
      return <Package className="h-4 w-4" />;
    case "prepared":
      return <Coffee className="h-4 w-4" />;
    case "both":
      return (
        <div className="relative">
          <Package className="h-4 w-4" />
          <Coffee className="h-3 w-3 absolute -bottom-1 -right-1" />
        </div>
      );
  }
};

export const getStatusColor = (status: "normal" | "low" | "critical") => {
  switch (status) {
    case "normal":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "low":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

export const getMovementIcon = (type: "entrada" | "salida" | "ajuste") => {
  switch (type) {
    case "entrada":
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    case "salida":
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    case "ajuste":
      return <History className="h-4 w-4 text-yellow-600" />;
  }
};