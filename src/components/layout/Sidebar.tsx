import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package2,
  Boxes,
  Users2,
  FileBarChart2,
  Store,
  UserCircle,
  Menu,
  X,
  Users,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ShoppingCart, label: "Ventas", path: "/sales" },
  { icon: Receipt, label: "Gastos", path: "/expenses" },
  { icon: Package2, label: "Mis Productos", path: "/catalog" },
  { icon: Boxes, label: "Inventario", path: "/inventory" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: Users2, label: "Empleados", path: "/employees" },
  { icon: FileBarChart2, label: "Reportes", path: "/reports" },
  { icon: Store, label: "Mis Clubs", path: "/clubs" },
  { icon: UserCircle, label: "Mi Cuenta", path: "/account" },
];

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar");
      const menuButton = document.getElementById("menu-button");
      
      if (sidebar && menuButton && 
          !sidebar.contains(event.target as Node) && 
          !menuButton.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        id="menu-button"
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-background/80 backdrop-blur-xl border-r shadow-xl transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Logo */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/90 to-purple-600 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Arximia
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                      "hover:bg-primary/5 hover:text-primary active:scale-[0.98]",
                      isActive && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}