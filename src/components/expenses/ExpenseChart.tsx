import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const categoryColors = {
  producto: '#3B82F6',
  rent: '#8B5CF6',
  services: '#EAB308',
  others: '#6B7280',
};

interface ChartDataItem {
  category: string;
  total: number;
}

interface ExpenseChartProps {
  chartData: ChartDataItem[];
}

export function ExpenseChart({ chartData }: ExpenseChartProps) {
  // Transformamos la data para asignarle nombres y colores según la categoría.
  const transformedData = chartData.map((item) => {
    let name = '';
    switch (item.category) {
      case 'producto':
        name = 'Producto';
        break;
      case 'rent':
        name = 'Renta';
        break;
      case 'services':
        name = 'Servicios';
        break;
      default:
        name = 'Otros';
    }
    const color = categoryColors[item.category as keyof typeof categoryColors] || categoryColors.others;
    return { ...item, name, color };
  });

  // Si no hay datos, mostramos un mensaje.
  if (!transformedData.length) {
    return (
      <div className="flex justify-center items-center h-full">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="total"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
