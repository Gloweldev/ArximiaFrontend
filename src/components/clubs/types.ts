export interface Club {
  id: string;
  name: string;
  image: string;
  address: string;
  status: "active" | "inactive";
  employeesCount: number;
  monthlyStats: {
    sales: number;
    expenses: number;
    salesGoal: number;
  };
  contact: {
    phone: string;
    email: string;
  };
  schedule: {
    [key: string]: {
      closed: boolean;
      ranges: { open: string; close: string }[];
    };
  };
  paymentMethods: ("cash" | "card" | "transfer")[];
}