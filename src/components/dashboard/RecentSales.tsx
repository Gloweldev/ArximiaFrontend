import { useState, useEffect } from "react";
import api from "@/services/api";
import { useClub } from "@/context/ClubContext";

export function RecentSales() {
  const { activeClub } = useClub();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (activeClub) {
      const fetchRecentSales = async () => {
        try {
          const res = await api.get("/dashboard/recent-sales", {
            params: { clubId: activeClub },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setSales(res.data);
        } catch (error) {
          console.error("Error fetching recent sales", error);
        }
      };
      fetchRecentSales();
    }
  }, [activeClub]);

  return (
    <div className="p-6">
      <div className="space-y-1">
        <h3 className="font-medium">Últimas Ventas</h3>
        <p className="text-sm text-muted-foreground">
          Ventas más recientes del día
        </p>
      </div>
      <div className="space-y-8 mt-6">
        {sales.map((sale) => {
          const client = sale.client || { name: "Cliente desconocido", phone: "Sin teléfono" };
          const employee = sale.employee || { nombre: "Empleado desconocido", displayName: "" };
          return (
            <div key={sale._id} className="border-b pb-4">
              <div className="mb-2">
                <p className="text-sm font-medium">Cliente: {client.name}</p>
                <p className="text-xs text-muted-foreground">Teléfono: {client.phone}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm">
                  <span className="font-medium">Atendido por:</span> {employee.displayName || employee.nombre}
                </p>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium">Productos:</p>
                {sale.itemGroups && sale.itemGroups.length > 0 ? (
                  sale.itemGroups.map((group: any, index: number) => (
                    <div key={index} className="ml-4 mb-1">
                      <p className="text-xs font-semibold">{group.name}</p>
                      <ul className="ml-4 list-disc">
                        {group.items.map((item: any, idx: number) => {
                          // Si el producto fue poblado
                          const product = item.product_id;
                          if (!product) {
                            return (
                              <li key={idx} className="text-xs">
                                Producto no encontrado
                              </li>
                            );
                          }
                          if (item.type === "prepared") {
                            // Para preparados se muestra: nombre, sabor, cantidad, porciones y precio por porción
                            return (
                              <li key={idx} className="text-xs">
                                {product.name} - {product.flavor ? `${product.flavor}` : ""}{item.quantity > 1 ? ` x${item.quantity}` : ""} ({item.portions || 0} porciones){item.pricePerPortion ? ` $${item.pricePerPortion.toFixed(2)}` : ""}
                              </li>
                            );
                          } else {
                            // Para sellados se muestra: nombre, cantidad y precio unitario de venta (salePrice)
                            return (
                              <li key={idx} className="text-xs">
                                {product.name} - {item.quantity} x ${product.salePrice}
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="ml-4 text-xs text-muted-foreground">No hay productos registrados.</p>
                )}
              </div>
              <div className="mt-2 text-right font-medium">
                Total: ${sale.total.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


