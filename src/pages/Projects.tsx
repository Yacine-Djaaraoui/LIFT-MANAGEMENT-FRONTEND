import React, { useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useVerifyProject,
} from "@/hooks/useProjects";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export const Projects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);

  const {
    data: projectsData,
    isLoading,
    error,
  } = useProjects({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteProject();
  const verifyMutation = useVerifyProject();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleVerify = (id: string) => {
    verifyMutation.mutate(id);
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

  const getStatusBadge = (project: any) => {
    const today = new Date();
    const startDate = new Date(project.start_date);
    const endDate = project.end_date ? new Date(project.end_date) : null;

    if (startDate > today) {
      return <Badge variant="outline">À venir</Badge>;
    } else if (endDate && endDate < today) {
      return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
    }
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

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un projet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Maintenances</TableHead>
              <TableHead>Vérification</TableHead>
              <TableHead>Employés</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : projectsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucun projet trouvé
                </TableCell>
              </TableRow>
            ) : (
              projectsData?.results?.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    {typeof project.client === "object"
                      ? project.client.name
                      : project.client}
                  </TableCell>
                  <TableCell>
                    {new Date(project.start_date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>{getStatusBadge(project)}</TableCell>
                  <TableCell>
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
                  <TableCell>
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
                  <TableCell>
                    {project.assigned_employers?.length || 0} employé(s)
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!project.is_verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerify(project.id)}
                          disabled={verifyMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
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
