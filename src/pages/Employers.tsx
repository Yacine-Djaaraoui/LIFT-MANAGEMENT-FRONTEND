import React, { useState } from "react";
import { useEmployers, useDeleteEmployer } from "@/hooks/useEmployers";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployerForm } from "@/components/EmployerForm";
import { Badge } from "@/components/ui/badge";

export const Employers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Only pass group to API if it's not empty and not "all"
  const apiGroup =
    selectedGroup && selectedGroup !== "all" ? selectedGroup : undefined;

  // Fetch filtered employers for the table
  const {
    data: employersData,
    isLoading,
    error,
    refetch,
  } = useEmployers({
    search: searchTerm,
    group: apiGroup,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  // Fetch ALL employers (without filters) to get all available groups
  const { data: allEmployersData } = useEmployers({
    page_size: "1000", // Fetch a large number to get all groups
    ordering: "group",
  });

  const deleteMutation = useDeleteEmployer();

  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage("");
    } else {
      setErrorMessage(message);
      setSuccessMessage("");
    }

    // Auto hide after 5 seconds
    setTimeout(() => {
      if (type === "success") {
        setSuccessMessage("");
      } else {
        setErrorMessage("");
      }
    }, 5000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMessage("Employé supprimé avec succès", "success");
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la suppression de l'employé";
      showMessage(message, "error");
    }
  };

  const handleEdit = (employer: any) => {
    setEditingEmployer(employer);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingEmployer(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployer(null);
  };

  const handleFormSuccess = (message: string) => {
    handleFormClose();
    showMessage(message, "success");
    refetch();
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "group") {
      setSelectedGroup(value);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("all");
    setCurrentPage(1);
  };

  // Clear messages when search term or filters change
  React.useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, [searchTerm, selectedGroup]);

  // Show error from useEmployers hook
  React.useEffect(() => {
    if (error) {
      showMessage(
        error.message || "Erreur lors du chargement des employés",
        "error"
      );
    }
  }, [error]);

  // Extract unique groups from ALL employers data (not filtered)
  const availableGroups = React.useMemo(() => {
    if (!allEmployersData?.results) return [];

    const groups = allEmployersData.results
      .map((employer: any) => employer.group)
      .filter(
        (group: string | null): group is string =>
          group !== null &&
          group !== undefined &&
          group !== "" &&
          group.trim() !== ""
      );

    return [...new Set(groups)].sort();
  }, [allEmployersData]);

  const hasActiveFilters = searchTerm !== "" || selectedGroup !== "all";

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des Employés
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Employé
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un employé..."
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
              {(searchTerm ? 1 : 0) + (selectedGroup !== "all" ? 1 : 0)}
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
            {/* Group Filter */}
            <div>
              <Label>Groupe</Label>
              <Select
                value={selectedGroup}
                onValueChange={(value) => handleFilterChange("group", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les groupes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les groupes</SelectItem>
                  {availableGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      {employersData && (
        <div className="text-sm text-gray-600">
          {employersData.count === 0 && "Aucun employé trouvé"}
        </div>
      )}

      {/* Employers Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nom d'utilisateur</TableHead>
              <TableHead className="text-left">Nom complet</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">Téléphone</TableHead>
              <TableHead className="text-left">Groupe</TableHead>
              <TableHead className="text-left">Wilaya</TableHead>
              <TableHead className="text-left w-[150px]">Actions</TableHead>
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
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-start space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : employersData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center text-gray-500">
                    <Search className="w-12 h-12 mb-2" />
                    <p>
                      {hasActiveFilters
                        ? "Aucun employé ne correspond aux critères de recherche"
                        : "Aucun employé trouvé"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employersData?.results?.map((employer: any) => (
                <TableRow key={employer.id}>
                  <TableCell className="font-medium text-left">
                    {employer.username}
                  </TableCell>
                  <TableCell className="text-left">
                    {employer.first_name && employer.last_name
                      ? `${employer.first_name} ${employer.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {employer.email || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {employer.phone_number || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employer.group
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {employer.group || "Non assigné"}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    {employer.wilaya || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-start space-x-2 min-h-[40px]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employer)}
                        className="flex items-center justify-center w-8 h-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center w-8 h-8 p-0"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer l'employé
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer l'employé "
                              {employer.username}" ? Cette action est
                              irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={deleteMutation.isPending}
                            >
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(employer.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending
                                ? "Suppression..."
                                : "Supprimer"}
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
      {employersData && employersData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, employersData.count)} sur{" "}
            {employersData.count} employés
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
              disabled={!employersData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Employer Form Dialog */}
      <EmployerForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        employer={editingEmployer}
      />
    </div>
  );
};
