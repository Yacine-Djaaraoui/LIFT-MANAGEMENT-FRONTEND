import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2 } from "lucide-react";

const clientSchema = yup.object({
  name: yup.string().required("Le nom du client est requis"),
  phone_number: yup.string().required("Le numéro de téléphone est requis"),
  email: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .email("Email invalide")
    .optional(),
  address: yup.object().optional(),
  is_corporate: yup.boolean().default(false),
});

interface ClientStepProps {
  onNext: () => void;
  onClientSelect: (client: any) => void;
  initialClient?: any;
}

export const ClientStep: React.FC<ClientStepProps> = ({
  onNext,
  onClientSelect,
  initialClient,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoadingInitialClient, setIsLoadingInitialClient] = useState(false);
  const [hasSearchedForInitialClient, setHasSearchedForInitialClient] =
    useState(false);

  // Always load all clients when we have an initial client to find
  const { data: clients, isLoading: isLoadingClients } = useClients({
    search: hasSearchedForInitialClient ? searchTerm : "",
  });
  const createClientMutation = useCreateClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(clientSchema),
  });

  // Debug logging
  useEffect(() => {
    console.log("ClientStep Debug:", {
      initialClient,
      selectedClient,
      clientsCount: clients?.results?.length,
      isLoadingInitialClient,
      hasSearchedForInitialClient,
    });
  }, [
    initialClient,
    selectedClient,
    clients,
    isLoadingInitialClient,
    hasSearchedForInitialClient,
  ]);

  // Find the full client data from the clients list based on initialClient
  useEffect(() => {
    const findAndSetInitialClient = async () => {
      if (!initialClient) {
        setHasSearchedForInitialClient(true);
        return;
      }

      // If we already have a selected client that matches, do nothing
      if (selectedClient && selectedClient.id === initialClient.id) {
        setHasSearchedForInitialClient(true);
        return;
      }

      setIsLoadingInitialClient(true);

      try {
        console.log("Looking for initial client:", initialClient);

        let fullClient = null;

        // Case 1: initialClient is already a complete client object
        if (initialClient.id && initialClient.name) {
          console.log("Initial client appears to be complete:", initialClient);
          fullClient = initialClient;
        }
        // Case 2: We need to find the client in the loaded list
        else if (clients?.results && clients.results.length > 0) {
          console.log("Searching in clients list:", clients.results);

          // Try to find by ID first
          if (initialClient.id) {
            fullClient = clients.results.find(
              (client: any) => client.id === initialClient.id
            );
            console.log("Search by ID result:", fullClient);
          }

          // If not found by ID, try by name
          if (!fullClient && initialClient.name) {
            fullClient = clients.results.find(
              (client: any) => client.name === initialClient.name
            );
            console.log("Search by name result:", fullClient);
          }

          // If initialClient is a string (name), search by name
          if (!fullClient && typeof initialClient === "string") {
            fullClient = clients.results.find(
              (client: any) => client.name === initialClient
            );
            console.log("Search by string name result:", fullClient);
          }
        }

        if (fullClient) {
          console.log("Found client, setting:", fullClient);
          setSelectedClient(fullClient);
          onClientSelect(fullClient);
        } else {
          console.warn(
            "Initial client not found in clients list. InitialClient:",
            initialClient,
            "Available clients:",
            clients?.results
          );

          // If initialClient has basic data but wasn't found in list, use it directly
          if (
            initialClient.id &&
            initialClient.name &&
            initialClient.phone_number
          ) {
            console.log("Using initial client data directly");
            setSelectedClient(initialClient);
            onClientSelect(initialClient);
          }
        }
      } catch (error) {
        console.error("Error loading initial client:", error);
      } finally {
        setIsLoadingInitialClient(false);
        setHasSearchedForInitialClient(true);
      }
    };

    // Only run if we have clients data or after a short delay
    if (clients || !initialClient) {
      findAndSetInitialClient();
    }
  }, [initialClient, clients, onClientSelect, selectedClient]);

  const handleClientSelect = (client: any) => {
    console.log("Client selected:", client);
    setSelectedClient(client);
    onClientSelect(client);
  };

  const handleCreateClient = async (data: any) => {
    try {
      const apiData: any = {
        name: data.name,
        phone_number: data.phone_number,
        is_corporate: data.is_corporate,
      };

      if (data.email) apiData.email = data.email;

      const newClient = await createClientMutation.mutateAsync(apiData);
      setSelectedClient(newClient);
      onClientSelect(newClient);
      setShowCreateForm(false);
      reset();
    } catch (error) {
      console.error("Error creating client:", error);
    }
  };

  const handleContinue = () => {
    if (selectedClient) {
      onNext();
    }
  };

  // Pre-fill form if creating a client with initial data
  useEffect(() => {
    if (showCreateForm && initialClient && typeof initialClient === "string") {
      setValue("name", initialClient);
    }
  }, [showCreateForm, initialClient, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sélectionner ou Créer un Client</h3>
        <p className="text-sm text-gray-600">
          Choisissez un client existant ou créez-en un nouveau
        </p>
      </div>

      {/* Debug info - remove in production */}
    
      {/* Loading State */}
      {(isLoadingInitialClient || isLoadingClients) && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <div className="text-gray-500">
            {isLoadingInitialClient
              ? "Chargement du client..."
              : "Chargement des clients..."}
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      {selectedClient && !isLoadingInitialClient && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Client Sélectionné</h4>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{selectedClient.name}</div>
              <div className="text-sm text-blue-600">
                {selectedClient.phone_number}
              </div>
              {selectedClient.email && (
                <div className="text-sm text-blue-600">
                  {selectedClient.email}
                </div>
              )}
              {selectedClient.is_corporate && (
                <div className="text-sm text-blue-600">Entreprise</div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedClient(null);
                onClientSelect(null);
                setSearchTerm("");
              }}
            >
              Changer
            </Button>
          </div>
        </div>
      )}

      {/* Search Existing Clients */}
      {!selectedClient &&
        hasSearchedForInitialClient &&
        !isLoadingInitialClient && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoadingClients ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {clients?.results?.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucun client trouvé
                  </div>
                ) : (
                  clients?.results?.map((client: any) => (
                    <div
                      key={client.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedClient?.id === client.id
                          ? "bg-blue-50 border-blue-200"
                          : ""
                      }`}
                      onClick={() => handleClientSelect(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-600">
                        {client.phone_number}
                      </div>
                      {client.email && (
                        <div className="text-sm text-gray-600">
                          {client.email}
                        </div>
                      )}
                      {client.is_corporate && (
                        <div className="text-sm text-gray-500">Entreprise</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

      {/* Create New Client */}
      {!selectedClient &&
        hasSearchedForInitialClient &&
        !isLoadingInitialClient && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un Nouveau Client
            </Button>

            {showCreateForm && (
              <form
                onSubmit={handleSubmit(handleCreateClient)}
                className="mt-4 space-y-4 p-4 border rounded-md"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                      <p className="text-red-500 text-sm">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone_number">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input id="phone_number" {...register("phone_number")} />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm">
                        {errors.phone_number.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">
                      Email <span className="text-gray-500">(Optionnel)</span>
                    </Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_corporate" {...register("is_corporate")} />
                    <Label htmlFor="is_corporate">Client Entreprise</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createClientMutation.isPending}
                  >
                    {createClientMutation.isPending
                      ? "Création..."
                      : "Créer Client"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!selectedClient || isLoadingInitialClient}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
