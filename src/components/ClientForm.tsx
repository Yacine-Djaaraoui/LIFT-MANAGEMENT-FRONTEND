import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Make optional fields truly optional with proper transformation
const clientSchema = yup.object({
  name: yup.string().required("Le nom du client est requis"),
  phone_number: yup.string().required("Le numéro de téléphone est requis"),
  email: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .email("Email invalide")
    .optional(),
  fax: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  is_corporate: yup.boolean().default(false),
  rc: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  nif: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  nis: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  ai: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  art: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  account_number: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  notes: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  address: yup
    .object()
    .shape({
      province: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .optional(),
      city: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .optional(),
      street: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .optional(),
      postal_code: yup
        .string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .optional(),
    })
    .optional()
    .default({}),
});

type ClientFormData = yup.InferType<typeof clientSchema>;

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  client?: any;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onClose,
  client,
}) => {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ClientFormData>({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: "",
      phone_number: "",
      email: "",
      fax: "",
      is_corporate: false,
      rc: "",
      nif: "",
      nis: "",
      ai: "",
      art: "",
      account_number: "",
      notes: "",
      address: {
        province: "",
        city: "",
        street: "",
        postal_code: "",
      },
    },
  });

  const isCorporate = watch("is_corporate");

  // Reset form with client data when client changes or dialog opens
  useEffect(() => {
    if (open && client) {
      console.log("Editing client:", client); // Debug log
      reset({
        name: client.name || "",
        phone_number: client.phone_number || "",
        email: client.email || "",
        fax: client.fax || "",
        is_corporate: client.is_corporate || false,
        rc: client.rc || "",
        nif: client.nif || "",
        nis: client.nis || "",
        ai: client.ai || "",
        art: client.art || "",
        account_number: client.account_number || "",
        notes: client.notes || "",
        address: client.address || {
          province: "",
          city: "",
          street: "",
          postal_code: "",
        },
      });
    } else if (open && !client) {
      // Reset to empty values for new client
      reset({
        name: "",
        phone_number: "",
        email: "",
        fax: "",
        is_corporate: false,
        rc: "",
        nif: "",
        nis: "",
        ai: "",
        art: "",
        account_number: "",
        notes: "",
        address: {
          province: "",
          city: "",
          street: "",
          postal_code: "",
        },
      });
    }
  }, [open, client, reset]);

  const handleCorporateChange = (checked: boolean) => {
    setValue("is_corporate", checked, { shouldValidate: true });
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      console.log("Form data submitted:", data); // Debug log

      // Prepare data for API - convert empty strings to null for all fields
      const apiData: any = {
        name: data.name,
        phone_number: data.phone_number,
        is_corporate: data.is_corporate, // This should now be correct
        email: data.email || null,
        fax: data.fax || null,
        notes: data.notes || null,
        rc: data.rc || null,
        nif: data.nif || null,
        nis: data.nis || null,
        ai: data.ai || null,
        art: data.art || null,
        account_number: data.account_number || null,
      };

      // Include address with cleaned values
      if (data.address) {
        apiData.address = {
          province: data.address.province || null,
          city: data.address.city || null,
          street: data.address.street || null,
          postal_code: data.address.postal_code || null,
        };
      }

      console.log("API data to send:", apiData); // Debug log

      if (client) {
        await updateMutation.mutateAsync({
          id: client.id,
          data: apiData,
        });
      } else {
        await createMutation.mutateAsync(apiData);
      }
      handleClose();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client
              ? `Modifier le Client: ${client.name}`
              : "Créer un Nouveau Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Values Display (for update) */}
          {/* {client && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">
                Valeurs Actuelles
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Type:</span>
                  <div className="font-medium">
                    {client.is_corporate ? "Entreprise" : "Particulier"}
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Téléphone:</span>
                  <div className="font-medium">{client.phone_number}</div>
                </div>
                {client.email && (
                  <div>
                    <span className="text-blue-600">Email:</span>
                    <div className="font-medium">{client.email}</div>
                  </div>
                )}
                {client.fax && (
                  <div>
                    <span className="text-blue-600">Fax:</span>
                    <div className="font-medium">{client.fax}</div>
                  </div>
                )}
                {client.nif && (
                  <div>
                    <span className="text-blue-600">NIF:</span>
                    <div className="font-medium">{client.nif}</div>
                  </div>
                )}
                {client.address?.city && (
                  <div>
                    <span className="text-blue-600">Ville:</span>
                    <div className="font-medium">{client.address.city}</div>
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de Base</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Nom du client"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone_number">
                  Téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  {...register("phone_number")}
                  placeholder="Numéro de téléphone"
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email">
                  Email <span className="text-gray-500">(Optionnel)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@exemple.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fax">
                  Fax <span className="text-gray-500">(Optionnel)</span>
                </Label>
                <Input
                  id="fax"
                  {...register("fax")}
                  placeholder="Numéro de fax"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_corporate"
                checked={isCorporate}
                onCheckedChange={handleCorporateChange}
              />
              <Label htmlFor="is_corporate" className="cursor-pointer">
                Client Entreprise
                {isCorporate && <span className="text-green-600 ml-2">✓</span>}
              </Label>
            </div>
            {errors.is_corporate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.is_corporate.message}
              </p>
            )}
          </div>

          {/* Legal and Corporate Information - Always Visible */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Informations Légales et Entreprise{" "}
              <span className="text-gray-500">(Optionnel)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rc">Registre de Commerce (RC)</Label>
                <Input id="rc" {...register("rc")} placeholder="Numéro RC" />
              </div>

              <div>
                <Label htmlFor="nif">
                  Numéro d'Identification Fiscale (NIF)
                </Label>
                <Input id="nif" {...register("nif")} placeholder="Numéro NIF" />
              </div>

              <div>
                <Label htmlFor="nis">
                  Numéro d'Identification Statistique (NIS)
                </Label>
                <Input id="nis" {...register("nis")} placeholder="Numéro NIS" />
              </div>

              <div>
                <Label htmlFor="ai">Article d'Imposition (AI)</Label>
                <Input id="ai" {...register("ai")} placeholder="Numéro AI" />
              </div>

              <div>
                <Label htmlFor="art">Numéro ART</Label>
                <Input id="art" {...register("art")} placeholder="Numéro ART" />
              </div>

              <div>
                <Label htmlFor="account_number">
                  Numéro de Compte Bancaire
                </Label>
                <Input
                  id="account_number"
                  {...register("account_number")}
                  placeholder="Numéro de compte"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Adresse <span className="text-gray-500">(Optionnel)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="address.province">Province</Label>
                <Input
                  id="address.province"
                  {...register("address.province")}
                  placeholder="Province"
                />
              </div>

              <div>
                <Label htmlFor="address.city">Ville</Label>
                <Input
                  id="address.city"
                  {...register("address.city")}
                  placeholder="Ville"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address.street">Adresse</Label>
                <Input
                  id="address.street"
                  {...register("address.street")}
                  placeholder="Adresse complète"
                />
              </div>

              <div>
                <Label htmlFor="address.postal_code">Code Postal</Label>
                <Input
                  id="address.postal_code"
                  {...register("address.postal_code")}
                  placeholder="Code postal"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <Label htmlFor="notes">
              Notes <span className="text-gray-500">(Optionnel)</span>
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Notes supplémentaires sur le client..."
              rows={4}
            />
          </div>

          {/* Debug Information (Development only) */}

          {/* Form Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Champs obligatoires
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Type de client:{" "}
              <strong>{isCorporate ? "Entreprise" : "Particulier"}</strong>
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : client ? "Modifier" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
