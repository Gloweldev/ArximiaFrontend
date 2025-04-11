import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Package, Coffee, User, Calendar, Search, ArrowUpDown } from "lucide-react";

interface Props {
  selectedClub: string;
  selectedPeriod: string;
  dateRange: {
    start: string;
    end: string;
  };
}

// Mock data
const transactions = [
  {
    id: "1",
    date: "2024-03-21T15:30:00",
    type: "sale",
    description: "Venta de productos",
    amount: 1250,
    items: [
      { name: "Fórmula 1", type: "sealed", quantity: 1 },
      { name: "Proteína", type: "prepared", quantity: 2 }
    ],
    employee: {
      name: "Ana Martínez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    status: "completed"
  },
  {
    id: "2",
    date: "2024-03-21T14:15:00",
    type: "expense",
    description: "Compra de inventario",
    amount: -5000,
    employee: {
      name: "Roberto Sánchez",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36"
    },
    status: "completed"
  },
  {
    id: "3",
    date: "2024-03-20T11:30:00",
    type: "inventory",
    description: "Ajuste de inventario",
    items: [
      { name: "Té Verde", type: "sealed", quantity: -2 }
    ],
    employee: {
      name: "Ana Martínez",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    status: "completed"
  },
  // Add more transactions...
];

export function TransactionHistoryReport({ selectedClub, selectedPeriod, dateRange }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.items?.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    
    const matchesType = transactionType === "all" || transaction.type === transactionType;
    
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <Package className="h-4 w-4 text-green-500" />;
      case "expense":
        return <Coffee className="h-4 w-4 text-red-500" />;
      case "inventory":
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Select
            value={transactionType}
            onValueChange={setTransactionType}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de transacción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las transacciones</SelectItem>
              <SelectItem value="sale">Ventas</SelectItem>
              <SelectItem value="expense">Gastos</SelectItem>
              <SelectItem value="inventory">Ajustes de Inventario</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('date')}
                  className="hover:bg-transparent"
                >
                  Fecha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Monto/Detalle</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(transaction.date).toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    {transaction.items && (
                      <div className="text-sm text-muted-foreground">
                        {transaction.items.map((item, index) => (
                          <div key={index}>
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img
                      src={transaction.employee.avatar}
                      alt={transaction.employee.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span>{transaction.employee.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.amount ? (
                    <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Ajuste de inventario
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(transaction.status)}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}