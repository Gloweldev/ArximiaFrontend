import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { toast } from "sonner";
import api from "@/services/api";

interface DataItem {
  name: string;
  sales: number;
  expenses: number;
}

interface SalesChartProps {
  period: "weekly" | "monthly" | "annual";
  clubId: string;
}

const normalizeDate = (data: DataItem[]) => {
  return data.map(item => ({
    ...item,
    name: new Date(item.name + 'T00:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })
  }));
};

export function SalesChart({ period, clubId }: SalesChartProps) {
  const [data, setData] = useState<DataItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/dashboard/sales-vs-expenses", {
          params: { clubId, period },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(res.data);
      } catch (error) {
        console.error("Error fetching sales vs expenses data:", error);
        toast.error("Error al obtener datos de la gráfica");
      }
    };
    if (clubId) {
      fetchData();
    }
  }, [clubId, period]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Fecha
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {payload[0].payload.name}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Ventas
                      </span>
                      <span className="font-bold text-green-500">
                        ${payload[0].value}
                      </span>
                    </div>
                    <div className="flex flex-col col-start-2">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Gastos
                      </span>
                      <span className="font-bold text-red-500">
                        ${payload[1].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Line
          name="Ventas"
          type="monotone"
          dataKey="sales"
          stroke="#22c55e"
          strokeWidth={2}
          dot={false}
        />
        <Line
          name="Gastos"
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
