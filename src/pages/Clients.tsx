import React, { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { Plus, Search, Edit, Trash2, Building, User } from "lucide-react";
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

  const {
    data: clientsData,
    isLoading,
    error,
  } = useClients({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteClient();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingClient(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement des clients
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Adresse</TableHead>
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
            ) : clientsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            ) : (
              clientsData?.results?.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {client.is_corporate ? (
                        <>
                          <Building className="w-4 h-4 mr-1 text-blue-600" />
                          <span>Entreprise</span>
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4 mr-1 text-green-600" />
                          <span>Particulier</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{client.phone_number}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>
                    {client.address ? (
                      <div className="text-sm">
                        {client.address.street && (
                          <div>{client.address.street}</div>
                        )}
                        {client.address.city && (
                          <div>{client.address.city}</div>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
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
                          <Button variant="outline" size="sm">
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
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(client.id)}
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
        client={editingClient}
      />
    </div>
  );
};
