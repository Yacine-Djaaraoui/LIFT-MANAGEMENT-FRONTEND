import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Receipt,
} from "lucide-react";
import logo from "@/assets/kr7_logo-1-removebg-preview.png";
const menuItems = [
  { path: "/statistics", label: "Tableau de Bord", icon: LayoutDashboard },
  { path: "/stock", label: "Stock", icon: Package },
  { path: "/clients", label: "Clients", icon: Users },
  { path: "/projects", label: "Projets", icon: FileText },
  { path: "/invoices", label: "Factures", icon: Receipt },
  { path: "/calendar", label: "Calendrier", icon: Calendar },
  // { path: "/statistics", label: "Statistiques", icon: BarChart3 },
  { path: "/employers", label: "Employés", icon: Users },
  { path: "/assistants", label: "Assistants", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <img src={logo} alt="" className="w-40 mx-auto" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-800">EURL KR7 FIBRE</h1>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
