import React from "react";
import { useProjects } from "@/hooks/useProjects";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, Euro } from "lucide-react";

export const Statistics: React.FC = () => {
  const { data: projects } = useProjects();
  const { data: invoices } = useInvoices();
  const { data: products } = useProducts();

  // Calculate statistics
  const totalProjects = projects?.count || 0;
  const verifiedProjects =
    projects?.results?.filter((p: any) => p.is_verified).length || 0;
  const totalProducts = products?.count || 0;
  const lowStockProducts =
    products?.results?.filter((p: any) => p.is_low_stock).length || 0;
  const totalRevenue =
    invoices?.results?.reduce(
      (sum: number, invoice: any) => sum + parseFloat(invoice.total),
      0
    ) || 0;

  // Monthly project data
  const monthlyProjects = [
    { month: "Jan", projects: 12, verified: 8 },
    { month: "Fév", projects: 19, verified: 15 },
    { month: "Mar", projects: 15, verified: 12 },
    { month: "Avr", projects: 22, verified: 18 },
    { month: "Mai", projects: 18, verified: 14 },
    { month: "Jun", projects: 25, verified: 20 },
  ];

  // Project status distribution
  const projectStatusData = [
    { name: "En cours", value: 45 },
    { name: "Terminé", value: 30 },
    { name: "À venir", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Tableau de Bord Statistiques
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedProjects} projets vérifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produits en Stock
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts} produits en stock faible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Chiffre d'affaires global
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de Réussite
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProjects > 0
                ? ((verifiedProjects / totalProjects) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Projets vérifiés</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projets par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProjects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="projects" name="Total Projets" fill="#8884d8" />
                <Bar
                  dataKey="verified"
                  name="Projets Vérifiés"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des Projets</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
