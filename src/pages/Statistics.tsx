import React from "react";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Package,
  Euro,
  FileText,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ShoppingCart,
  Building,
  UserCheck,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  useFinancialAnalytics,
  useInventoryAnalytics,
  useProjectsAnalytics,
  useRecentActivity,
  useDashboardSummary,
} from "@/hooks/useStatistics";
import { Badge } from "@/components/ui/badge";

export const Statistics: React.FC = () => {
  const { data: financialData, isLoading: financialLoading } =
    useFinancialAnalytics();
  const { data: inventoryData, isLoading: inventoryLoading } =
    useInventoryAnalytics();
  const { data: projectsData, isLoading: projectsLoading } =
    useProjectsAnalytics();
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity();
  const { data: summaryData, isLoading: summaryLoading } =
    useDashboardSummary();

  const isLoading =
    financialLoading ||
    inventoryLoading ||
    projectsLoading ||
    activityLoading ||
    summaryLoading;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const revenueTrendData = financialData?.revenue_trend || [];
  const projectStatusData = [
    {
      name: "Actifs",
      value: summaryData?.projects?.active || 0,
      color: "#10B981",
    },
    {
      name: "À venir",
      value: summaryData?.projects?.upcoming || 0,
      color: "#3B82F6",
    },
    {
      name: "Terminés",
      value: summaryData?.projects?.completed || 0,
      color: "#6B7280",
    },
  ];

  const invoiceStatusData = [
    {
      name: "Brouillons",
      value: summaryData?.financial?.draft_invoices || 0,
      color: "#6B7280",
    },
    {
      name: "Émises",
      value: summaryData?.financial?.issued_invoices || 0,
      color: "#3B82F6",
    },
    {
      name: "Payées",
      value: summaryData?.financial?.paid_invoices || 0,
      color: "#10B981",
    },
  ];

  const topClientsData = financialData?.top_revenue_clients?.slice(0, 5) || [];
  const criticalStockData = inventoryData?.critical_stock_alerts || [];
  const mostUsedProducts = inventoryData?.most_used_products?.slice(0, 5) || [];
  const recentActivities = recentActivity?.activities?.slice(0, 10) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <div className="text-sm text-gray-500">
          Dernière mise à jour:{" "}
          {new Date(summaryData?.generated_at).toLocaleString("fr-FR")}
        </div>
      </div>

      {/* Key Metrics Cards */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendance des Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Revenu",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Projets"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Clients by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clients par Revenu</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClientsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="client_name" width={80} />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Revenu",
                  ]}
                />
                <Bar dataKey="total_revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut des Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceStatusData}
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
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Factures"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Stock Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Alertes Stock Critique
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criticalStockData.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Aucune alerte de stock critique
              </div>
            ) : (
              <div className="space-y-3">
                {criticalStockData.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">
                        SKU: {product.sku}
                      </div>
                    </div>
                    <Badge variant="destructive">
                      {product.quantity} {product.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Used Products */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              Produits les Plus Utilisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mostUsedProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      Utilisé {product.times_used} fois
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(product.revenue_generated)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock: {product.current_stock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-green-500 mr-2" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-2 border rounded"
                >
                  <div
                    className={`p-1 rounded ${
                      activity.type === "maintenance"
                        ? "bg-blue-100"
                        : activity.type === "client"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {activity.type === "maintenance" && (
                      <Activity className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "client" && (
                      <Users className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-gray-600">
                      {activity.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryData?.financial?.total_revenue || 0)}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Payé:{" "}
                {formatCurrency(summaryData?.financial?.paid_revenue || 0)}
              </span>
              <span
                className={
                  summaryData?.financial?.collection_rate < 50
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                Taux:{" "}
                {formatPercent(summaryData?.financial?.collection_rate || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Projects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.projects?.total || 0}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Actifs: {summaryData?.projects?.active || 0}</span>
              <span className="text-green-500">
                Vérifiés:{" "}
                {formatPercent(summaryData?.projects?.verification_rate || 0)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.inventory?.total_products || 0}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Valeur:{" "}
                {formatCurrency(summaryData?.inventory?.total_stock_value || 0)}
              </span>
              <span
                className={
                  summaryData?.inventory?.low_stock > 0
                    ? "text-orange-500"
                    : "text-green-500"
                }
              >
                Alertes: {summaryData?.inventory?.low_stock || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Clients Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.clients?.total || 0}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Actifs: {summaryData?.clients?.active_clients || 0}</span>
              <span>
                Entreprises:{" "}
                {formatPercent(summaryData?.clients?.corporate_percentage || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
            Indicateurs Clés de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatPercent(summaryData?.kpis?.project_completion_rate || 0)}
              </div>
              <div className="text-sm text-gray-600">Taux Achèvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summaryData?.kpis?.revenue_per_project || 0)}
              </div>
              <div className="text-sm text-gray-600">Revenu/Projet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summaryData?.kpis?.revenue_per_client || 0)}
              </div>
              <div className="text-sm text-gray-600">Revenu/Client</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatPercent(summaryData?.kpis?.maintenance_coverage || 0)}
              </div>
              <div className="text-sm text-gray-600">
                Couverture Maintenance
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summaryData?.kpis?.stock_turnover_risk || 0}
              </div>
              <div className="text-sm text-gray-600">Risque Stock</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
