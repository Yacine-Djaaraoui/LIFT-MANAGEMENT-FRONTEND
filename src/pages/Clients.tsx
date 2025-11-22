import React, { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  User,
  CheckCircle,
  XCircle,
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
import { ClientForm } from "@/components/ClientForm";

export const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useClients({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteClient();

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
      showMessage("Client supprimé avec succès", "success");
      refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la suppression du client";
      showMessage(message, "error");
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (success: boolean = false) => {
    setIsFormOpen(false);
    setEditingClient(null);
    if (success) {
      refetch();
    }
  };

  const handleFormSuccess = () => {
    handleFormClose(true);
    showMessage(
      editingClient ? "Client modifié avec succès" : "Client créé avec succès",
      "success"
    );
  };

  // Clear messages when search term changes
  React.useEffect(() => {
    setSuccessMessage("");
    setErrorMessage("");
  }, [searchTerm]);

  // Show error from useClients hook
  React.useEffect(() => {
    if (error) {
      showMessage(
        error.message || "Erreur lors du chargement des clients",
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
          Gestion des Clients
        </h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Client
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un client..."
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
              <TableHead className="text-left">Nom</TableHead>
              <TableHead className="text-left">Type</TableHead>
              <TableHead className="text-left">Téléphone</TableHead>
              <TableHead className="text-left">Email</TableHead>
              <TableHead className="text-left">Adresse</TableHead>
              <TableHead className="text-left">Date de création</TableHead>
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
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : clientsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center text-gray-500">
                    <Search className="w-12 h-12 mb-2" />
                    <p>Aucun client trouvé</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clientsData?.results?.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium text-left">
                    {client.name}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center">
                      {client.is_corporate ? (
                        <>
                          <Building className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Entreprise</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-2 text-green-600" />
                          <span>Particulier</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    {client.phone_number}
                  </TableCell>
                  <TableCell className="text-left">
                    {client.email || "-"}
                  </TableCell>
                  <TableCell className="text-left">
                    {client.address ? (
                      <div className="text-sm">
                        {client.address.street && (
                          <div>{client.address.street}</div>
                        )}
                        {client.address.province && (
                          <span>{client.address.province}</span>
                        )}
                        {client.address.city && (
                          <span>{" , "}{client.address.city}</span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    {new Date(client.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer le client
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le client "
                              {client.name}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={deleteMutation.isPending}
                            >
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(client.id)}
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
      {clientsData && clientsData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, clientsData.count)} sur{" "}
            {clientsData.count} clients
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
              disabled={!clientsData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Client Form Dialog */}
      <ClientForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        client={editingClient}
      />
    </div>
  );
};
