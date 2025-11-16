import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Loader2 } from "lucide-react";
import { ClientForm } from "@/components/ClientForm"; // Adjust the import path as needed

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
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [mode, setMode] = useState<"select" | "create">("select");
  const [showClientForm, setShowClientForm] = useState(false);

  // Load clients with search
  const { data: clients, isLoading: isLoadingClients } = useClients({
    search: searchTerm,
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

  // Set initial client if provided
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current && initialClient) {
      setSelectedClient(initialClient);
      onClientSelect(initialClient);
      firstLoad.current = false;
    }
  }, [initialClient, onClientSelect]);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    onClientSelect(client);
  };

  const handleCreateClientSuccess = (newClient: any) => {
    setSelectedClient(newClient);
    onClientSelect(newClient);
    setShowClientForm(false);
    setMode("select");
    reset();
  };

  const handleContinue = () => {
    if (selectedClient) {
      onNext();
    }
  };

  const handleChangeClient = () => {
    setSelectedClient(null);
    onClientSelect(null);
    setSearchTerm("");
    setMode("select");
  };

  // Pre-fill form if creating a client with initial data
  useEffect(() => {
    if (
      mode === "create" &&
      initialClient &&
      typeof initialClient === "string"
    ) {
      setValue("name", initialClient);
    }
  }, [mode, initialClient, setValue]);

  // Render based on current mode and selection
  const renderContent = () => {
    // If we have a selected client, show the selection display
    if (selectedClient) {
      return (
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
              {selectedClient.address?.city && (
                <div className="text-sm text-blue-600">
                  {selectedClient.address?.city}
                </div>
              )}
              {selectedClient.address?.province && (
                <div className="text-sm text-blue-600">
                  {selectedClient.address?.province}
                </div>
              )}
              {selectedClient.address?.street && (
                <div className="text-sm text-blue-600">
                  {selectedClient.address?.street}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleChangeClient}>
              Changer
            </Button>
          </div>
        </div>
      );
    }

    // If we're in create mode, show the create form button (the actual form is in the dialog)
    if (mode === "create") {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Créer un Nouveau Client</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("select")}
            >
              ← Retour à la sélection
            </Button>
          </div>

          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              Cliquez sur le bouton ci-dessous pour ouvrir le formulaire de
              création de client
            </p>
            <Button onClick={() => setShowClientForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ouvrir le Formulaire de Création
            </Button>
          </div>
        </div>
      );
    }

    // Default: show client selection (search and list)
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients List */}
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
                  className="p-4 border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-600">
                    {client.phone_number}
                  </div>
                  {client.email && (
                    <div className="text-sm text-gray-600">{client.email}</div>
                  )}
                  {client.is_corporate && (
                    <div className="text-sm text-gray-500">Entreprise</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create New Client Button */}
        <Button
          variant="outline"
          onClick={() => setMode("create")}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Créer un Nouveau Client
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Sélectionner ou Créer un Client</h3>
        <p className="text-sm text-gray-600">
          Choisissez un client existant ou créez-en un nouveau
        </p>
      </div>

      {renderContent()}

      {/* Client Form Dialog */}
      <ClientForm
        open={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          // If no client is selected and we close the form, go back to select mode
          if (!selectedClient) {
            setMode("select");
          }
        }}
        client={undefined} // Always create new client in this context
        onSuccess={handleCreateClientSuccess}
      />

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedClient}>
          Continuer
        </Button>
      </div>
    </div>
  );
};
