export type ProductType = "sealed" | "prepared" | "both";

export interface Product {
  catalogPrice: any;
  flavor: any;
  id: string;
  name: string;
  type: ProductType;
  salePrice: number;
  stock: {
    sealed: number;
    preparation: {
      units: number;
      portionsPerUnit: number;
      currentPortions: number;
    };
  };
  lastUpdated: string;
  status: "normal" | "low" | "critical";
}

export interface Movement {
  id: string;
  date: string;
  type: "entrada" | "salida" | "ajuste";
  quantity: number;
  user: string;
  description: string;
}