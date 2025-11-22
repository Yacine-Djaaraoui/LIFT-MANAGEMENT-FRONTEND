import React, { useState } from "react";
import { useAssistants, useDeleteAssistant } from "@/hooks/useAssistants";
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
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
import { AssistantForm } from "@/components/AssistantForm";

export const Assistants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    data: assistantsData,
    isLoading,
    error,
    refetch,
  } = useAssistants({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteAssistant();

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
      showMessage("Assistant supprimé avec succès", "success");
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la suppression de l'assistant";
      showMessage(message, "error");
    }
  };

  const handleEdit = (assistant: any) => {
    setEditingAssistant(assistant);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingAssistant(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (success: boolean = false) => {
    setIsFormOpen(false);
    setEditingAssistant(null);
    if (success) {
      refetch();
    }
  };

  const handleFormSuccess = () => {
    handleFormClose(true);
    showMessage(
      editingAssistant
        ? "Assistant modifié avec succès"
        : "Assistant créé avec succès",
      "success"
    );
  };

  // Clear messages when search term changes
  React.useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, [searchTerm]);

  // Show error from useAssistants hook
  React.useEffect(() => {
    if (error) {
      showMessage(
        error.message || "Erreur lors du chargement des assistants",
        "error"
      );
    }
  }, [error]);

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
          Gestion des Assistants
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Assistant
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un assistant..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nom d'utilisateur</TableHead>
              <TableHead className="text-left">Nom complet</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">Téléphone</TableHead>
              <TableHead className="text-left">Wilaya</TableHead>
              {/* <TableHead className="text-left">Date de création</TableHead> */}
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
            ) : assistantsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center text-gray-500">
                    <Search className="w-12 h-12 mb-2" />
                    <p>Aucun assistant trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              assistantsData?.results?.map((assistant: any) => (
                <TableRow key={assistant.id}>
                  <TableCell className="font-medium text-left">
                    {assistant.username}
                  </TableCell>
                  <TableCell className="text-left">
                    {assistant.first_name && assistant.last_name
                      ? `${assistant.first_name} ${assistant.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {assistant.email || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {assistant.phone_number || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {assistant.wilaya || "-"}
                  </TableCell>
                  {/* <TableCell className="text-left">
                    {new Date(assistant.created_at).toLocaleDateString("fr-FR")}
                  </TableCell> */}
                  <TableCell className="text-left">
                    <div className="flex items-center justify-start space-x-2 min-h-[40px]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assistant)}
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
                              Supprimer l'assistant
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer l'assistant "
                              {assistant.username}" ? Cette action est
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
                              onClick={() => handleDelete(assistant.id)}
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
      {assistantsData && assistantsData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, assistantsData.count)} sur{" "}
            {assistantsData.count} assistants
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
              disabled={!assistantsData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Assistant Form Dialog */}
      <AssistantForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        assistant={editingAssistant}
      />
    </div>
  );
};
