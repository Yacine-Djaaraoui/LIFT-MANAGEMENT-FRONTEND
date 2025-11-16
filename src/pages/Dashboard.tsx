import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useInvoices } from "@/hooks/useInvoices";
import { useProducts } from "@/hooks/useProducts";
import {
  TrendingUp,
  Users,
  Package,
  Euro,
  Calendar,
  AlertTriangle,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { data: projects } = useProjects({
    page_size: "5",
    ordering: "-created_at",
  });
  const { data: clients } = useClients();
  const { data: invoices } = useInvoices();
  const { data: products } = useProducts();

  const verifiedProjects =
    projects?.results?.filter((p: any) => p.is_verified).length || 0;
  const lowStockProducts =
    products?.results?.filter((p: any) => p.is_low_stock).length || 0;
  const totalRevenue =
    invoices?.results?.reduce(
      (sum: number, invoice: any) => sum + parseFloat(invoice.total),
      0
    ) || 0;
  const pendingInvoices =
    invoices?.results?.filter((i: any) => i.status === "ISSUED").length || 0;

  const stats = [
    {
      title: "Total Projets",
      value: projects?.count || 0,
      subtitle: `${verifiedProjects} vérifiés`,
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Clients",
      value: clients?.count || 0,
      subtitle: "Clients actifs",
      icon: Users,
      color: "green",
    },
    {
      title: "Produits en Stock",
      value: products?.count || 0,
      subtitle: `${lowStockProducts} stock faible`,
      icon: Package,
      color: "orange",
    },
    {
      title: "Revenu Total",
      value: `${totalRevenue.toFixed(2)} DA`,
      subtitle: `${pendingInvoices} factures en attente`,
      icon: Euro,
      color: "purple",
    },
  ];

  const getUpcomingProjects = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return (
      projects?.results?.filter((project: any) => {
        const startDate = new Date(project.start_date);
        return startDate >= today && startDate <= nextWeek;
      }) || []
    );
  };

  const upcomingProjects = getUpcomingProjects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
        <p className="text-gray-600">Bienvenue dans votre espace de gestion</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Projets Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects?.results?.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun projet trouvé
              </p>
            ) : (
              <div className="space-y-4">
                {projects?.results?.slice(0, 5).map((project: any) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-600">
                        {project.client.name} •{" "}
                        {new Date(project.start_date).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.is_verified
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {project.is_verified ? "Vérifié" : "En attente"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Projets à Venir (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun projet à venir cette semaine
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-600">
                        Début:{" "}
                        {new Date(project.start_date).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {project.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  Alerte Stock Faible
                </h3>
                <p className="text-sm text-yellow-700">
                  {lowStockProducts} produit(s) ont un stock faible et
                  nécessitent une réapprovisionnement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
