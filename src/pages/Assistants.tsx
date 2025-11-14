import React, { useState } from "react";
import { useAssistants, useDeleteAssistant } from "@/hooks/useAssistants";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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

  const {
    data: assistantsData,
    isLoading,
    error,
  } = useAssistants({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteAssistant();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (assistant: any) => {
    setEditingAssistant(assistant);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingAssistant(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAssistant(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement des assistants
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom d'utilisateur</TableHead>
              <TableHead>Nom complet</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Wilaya</TableHead>
              <TableHead>Date de création</TableHead>
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
            ) : assistantsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucun assistant trouvé
                </TableCell>
              </TableRow>
            ) : (
              assistantsData?.results?.map((assistant: any) => (
                <TableRow key={assistant.id}>
                  <TableCell className="font-medium">
                    {assistant.username}
                  </TableCell>
                  <TableCell>
                    {assistant.first_name && assistant.last_name
                      ? `${assistant.first_name} ${assistant.last_name}`
                      : "-"}
                  </TableCell>
                  <TableCell>{assistant.email || "-"}</TableCell>
                  <TableCell>{assistant.phone_number || "-"}</TableCell>
                  <TableCell>{assistant.wilaya || "-"}</TableCell>
                  <TableCell>
                    {new Date(assistant.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assistant)}
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
                              Supprimer l'assistant
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer l'assistant "
                              {assistant.username}" ? Cette action est
                              irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(assistant.id)}
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
        assistant={editingAssistant}
      />
    </div>
  );
};
