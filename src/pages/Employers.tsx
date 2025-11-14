import React, { useState } from "react";
import { useEmployers, useDeleteEmployer } from "@/hooks/useEmployers";
import { Plus, Search, Edit, Trash2, Filter } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployerForm } from "@/components/EmployerForm";

export const Employers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<any>(null);

  // Only pass group to API if it's not empty and not "all"
  const apiGroup =
    selectedGroup && selectedGroup !== "all" ? selectedGroup : undefined;

  // Fetch filtered employers for the table
  const {
    data: employersData,
    isLoading,
    error,
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

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
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

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGroup("");
    setCurrentPage(1);
  };

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement des employés
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des Employés
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Employé
        </Button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </h2>
          {(searchTerm || selectedGroup) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Effacer les filtres
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par groupe
            </label>
            <Select value={selectedGroup} onValueChange={handleGroupChange}>
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

          {/* Active Filters Display */}
          <div className="flex items-end">
            {(searchTerm || (selectedGroup && selectedGroup !== "all")) && (
              <div className="text-sm text-gray-600">
                Filtres actifs:
                {searchTerm && (
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Recherche: "{searchTerm}"
                  </span>
                )}
                {selectedGroup && selectedGroup !== "all" && (
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    Groupe: {selectedGroup}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      {employersData && (
        <div className="text-sm text-gray-600">
          {employersData.count === 0 ? (
            "Aucun employé trouvé"
          ) : (
            <>
              {searchTerm || (selectedGroup && selectedGroup !== "all")
                ? "Résultats de la recherche: "
                : "Total: "}
              <strong>{employersData.count}</strong> employé(s)
              {selectedGroup &&
                selectedGroup !== "all" &&
                ` dans le groupe "${selectedGroup}"`}
              {searchTerm && ` pour "${searchTerm}"`}
            </>
          )}
        </div>
      )}

      {/* Employers Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom d'utilisateur</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Groupe</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : employersData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  {searchTerm || (selectedGroup && selectedGroup !== "all")
                    ? "Aucun employé ne correspond aux critères de recherche"
                    : "Aucun employé trouvé"}
                </TableCell>
              </TableRow>
            ) : (
              employersData?.results?.map((employer: any) => (
                <TableRow key={employer.id}>
                  <TableCell className="font-medium">
                    {employer.username}
                  </TableCell>
                  <TableCell>
                    {employer.first_name && employer.last_name
                      ? `${employer.first_name} ${employer.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell>{employer.email || "-"}</TableCell>
                  <TableCell>{employer.phone_number || "-"}</TableCell>
                  <TableCell>
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
                  <TableCell>{employer.wilaya || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employer)}
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
                              Supprimer l'employé
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer l'employé "
                              {employer.username}" ? Cette action est
                              irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(employer.id)}
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
        employer={editingEmployer}
      />
    </div>
  );
};
