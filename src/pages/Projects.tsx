import React, { useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useVerifyProject,
  useUnVerifyProject,
} from "@/hooks/useProjects";
import { useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProjectForm } from "@/components/ProjectForm/ProjectForm";
import { MaintenanceDialog } from "@/components/MaintenanceDialog";
import { Badge } from "@/components/ui/badge";

// Algerian wilayas (provinces)
const ALGERIAN_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Menia",
];

export const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWilayas, setSelectedWilayas] = useState<string[]>([]);
  const [wilayaSearch, setWilayaSearch] = useState("");

  // Filters state - use "all" for empty values like calendar
  const [filters, setFilters] = useState({
    is_verified: "all",
    status: "all",
  });

  // Prepare API parameters exactly like calendar component
  const apiParams = {
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
    // Convert filters to API format - empty string for "all"
    is_verified: filters.is_verified === "all" ? "" : filters.is_verified,
    status: filters.status === "all" ? "" : filters.status,
    // Use selected wilayas as city filter - send array directly like calendar
    city: selectedWilayas.length > 0 ? selectedWilayas : undefined,
  };

  const { data: projectsData, isLoading, error } = useProjects(apiParams);

  const deleteMutation = useDeleteProject();
  const verifyMutation = useVerifyProject();
  const unverifyMutation = useUnVerifyProject();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  // Status translation function
  const translateStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      DRAFT: "BROUILLON",
      UPCOMING: "À VENIR",
      ACTIVE: "ACTIF",
      COMPLETED: "TERMINÉ",
    };
    return statusMap[status] || status;
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleVerifyToggle = async (project: any) => {
    try {
      if (project.is_verified) {
        // Unverify project and revert invoice to draft
        console.log(
          "Unverifying project and reverting invoice to draft",
          project.id,
          project.invoices[0]
        );
        await unverifyMutation.mutateAsync(project.id);

        // Update invoice status to revert_to_draft
        if (project.invoices[0]) {
          console.log(
            "Updating invoice status to revert_to_draft for invoice:",
            project.invoices[0]
          );
          await updateInvoiceStatusMutation.mutateAsync({
            id: project.invoices[0],
            action: "revert_to_draft",
          });
        } else {
          console.warn("No invoice_id found for project:", project.id);
        }
      } else {
        // Verify project and issue invoice
        console.log(
          "Verifying project and issuing invoice",
          project.id,
          project.invoices[0]
        );
        await verifyMutation.mutateAsync(project.id);

        // Update invoice status to issue
        if (project.invoices[0]) {
          console.log(
            "Updating invoice status to issue for invoice:",
            project.invoices[0]
          );
          await updateInvoiceStatusMutation.mutateAsync({
            id: project.invoices[0],
            action: "issue",
          });
        } else {
          console.warn("No invoice_id found for project:", project.id);
        }
      }
    } catch (error) {
      console.error("Error toggling project verification:", error);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleMaintenanceClick = (project: any) => {
    setSelectedProject(project);
    setIsMaintenanceDialogOpen(true);
  };

  const handleMaintenanceDialogClose = () => {
    setIsMaintenanceDialogOpen(false);
    setSelectedProject(null);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      is_verified: "all",
      status: "all",
    });
    setSelectedWilayas([]);
    setWilayaSearch("");
  };

  // Wilaya selection functions
  const toggleWilaya = (wilaya: string) => {
    setSelectedWilayas((prev) =>
      prev.includes(wilaya)
        ? prev.filter((w) => w !== wilaya)
        : [...prev, wilaya]
    );
  };

  const removeWilaya = (wilaya: string) => {
    setSelectedWilayas((prev) => prev.filter((w) => w !== wilaya));
  };

  const clearAllWilayas = () => {
    setSelectedWilayas([]);
  };

  // Filter wilayas based on search
  const filteredWilayas = ALGERIAN_WILAYAS.filter((wilaya) =>
    wilaya.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

  const getStatusBadge = (project: any) => {
    const status = project.status || "DRAFT";
    const translatedStatus = translateStatus(status);

    const statusClasses: { [key: string]: string } = {
      DRAFT: "bg-gray-100 text-gray-800",
      UPCOMING: "bg-blue-100 text-blue-800",
      ACTIVE: "bg-green-100 text-green-800",
      COMPLETED: "bg-purple-100 text-purple-800",
    };

    return <Badge className={statusClasses[status]}>{translatedStatus}</Badge>;
  };

  const getMaintenanceStatus = (project: any) => {
    const maintenances = project.maintenances || [];

    if (maintenances.length === 0) {
      return null;
    }

    const overdueCount = maintenances.filter((m: any) => m.is_overdue).length;
    const upcomingCount = maintenances.filter(
      (m: any) => m.days_until_maintenance <= 7 && !m.is_overdue
    ).length;

    // if (overdueCount > 0) {
    //   return (
    //     <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
    //       <Wrench className="w-3 h-3 mr-1" />
    //       {maintenances.length} planifiée(s)
    //     </Badge>
    //   );
    // }
  };

  const hasActiveFilters =
    filters.is_verified !== "all" ||
    filters.status !== "all" ||
    selectedWilayas.length > 0;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement des projets
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des Projets
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {selectedWilayas.length +
                (filters.is_verified !== "all" ? 1 : 0) +
                (filters.status !== "all" ? 1 : 0)}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtres</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wilaya Multi-Select - exactly like calendar */}
            <div className="md:col-span-2 lg:col-span-4">
              <Label>Wilayas</Label>
              <div className="space-y-2">
                {/* Selected wilayas badges */}
                {selectedWilayas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedWilayas.map((wilaya) => (
                      <Badge
                        key={wilaya}
                        variant="secondary"
                        className="flex items-center space-x-1 cursor-pointer"
                        onClick={() => removeWilaya(wilaya)}
                      >
                        <span>{wilaya}</span>
                        <X className="w-3 h-3" />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllWilayas}
                      className="h-6 px-2 text-xs"
                    >
                      Tout effacer
                    </Button>
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une wilaya..."
                    value={wilayaSearch}
                    onChange={(e) => setWilayaSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Wilayas list */}
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {filteredWilayas.length > 0 ? (
                    filteredWilayas.map((wilaya) => (
                      <div
                        key={wilaya}
                        className={`flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100 ${
                          selectedWilayas.includes(wilaya) ? "bg-blue-50" : ""
                        }`}
                        onClick={() => toggleWilaya(wilaya)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedWilayas.includes(wilaya)}
                          onChange={(e) => {
                            e.stopPropagation(); // avoid double events
                            toggleWilaya(wilaya);
                          }}
                          className="rounded border-gray-300"
                        />

                        <span className="text-sm">{wilaya}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Aucune wilaya trouvée
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {selectedWilayas.length} wilaya(s) sélectionnée(s)
                </p>
              </div>
            </div>

            {/* Verification Status */}
            <div>
              <Label>Vérification</Label>
              <Select
                value={filters.is_verified}
                onValueChange={(value) =>
                  handleFilterChange("is_verified", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les projets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  <SelectItem value="true">Projets vérifiés</SelectItem>
                  <SelectItem value="false">Projets non vérifiés</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project Status */}
            <div>
              <Label>Statut du projet</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="UPCOMING">À venir</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nom</TableHead>
              {/* <TableHead className="text-left">Client</TableHead> */}
              <TableHead className="text-left">Date de début</TableHead>
              <TableHead className="text-left">Statut</TableHead>
              <TableHead className="text-left">Maintenances</TableHead>
              <TableHead className="text-left">Vérification</TableHead>
              <TableHead className="text-left">Employés</TableHead>
              <TableHead className="text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : projectsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucun projet trouvé
                </TableCell>
              </TableRow>
            ) : (
              projectsData?.results?.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium text-left">
                    {project.name}
                  </TableCell>
                  {/* <TableCell className="text-left">
                    {typeof project.client === "object"
                      ? project.client.name
                      : project.client}
                  </TableCell> */}
                  <TableCell className="text-left">
                    {new Date(project.start_date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-left">
                    {getStatusBadge(project)}
                  </TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMaintenanceClick(project)}
                      className="flex items-center space-x-1"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Maintenances</span>
                      {getMaintenanceStatus(project)}
                    </Button>
                  </TableCell>
                  <TableCell className="text-left">
                    {project.is_verified ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="flex items-center w-fit"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    {project.assigned_employers?.length || 0} employé(s)
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyToggle(project)}
                        disabled={
                          verifyMutation.isPending ||
                          unverifyMutation.isPending ||
                          updateInvoiceStatusMutation.isPending
                        }
                        className={
                          project.is_verified
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-200 w-32"
                            : "bg-green-100 text-green-800 hover:bg-green-200 w-32"
                        }
                      >
                        {project.is_verified ? (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Dévérifier
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Vérifier
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer le projet
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le projet "
                              {project.name}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {projectsData && projectsData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, projectsData.count)} sur{" "}
            {projectsData.count} projets
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={!projectsData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectForm
        open={isFormOpen}
        onClose={handleFormClose}
        project={editingProject}
      />

      {/* Maintenance Dialog */}
      {selectedProject && (
        <MaintenanceDialog
          open={isMaintenanceDialogOpen}
          onClose={handleMaintenanceDialogClose}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
        />
      )}
    </div>
  );
};
