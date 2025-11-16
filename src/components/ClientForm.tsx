import React, { useEffect, useState } from "react";
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
import { Search } from "lucide-react";

// Algerian wilayas (provinces) - same list as in calendar
const ALGERIAN_WILAYAS = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
  "Timimoun",
  "Bordj Badji Mokhtar",
  "Ouled Djellal",
  "Béni Abbès",
  "In Salah",
  "In Guezzam",
  "Touggourt",
  "Djanet",
  "El M'Ghair",
  "El Menia",
];

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
  onSuccess?: (client: any) => void; // New prop for success callback
}

export const ClientForm: React.FC<ClientFormProps> = ({
  open,
  onClose,
  client,
  onSuccess,
}) => {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [showWilayaDropdown, setShowWilayaDropdown] = useState(false);

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
  const selectedCity = watch("address.city");

  // Filter wilayas based on search
  const filteredWilayas = ALGERIAN_WILAYAS.filter((wilaya) =>
    wilaya.toLowerCase().includes(wilayaSearch.toLowerCase())
  );

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

  const selectWilaya = (wilaya: string) => {
    setValue("address.city", wilaya, { shouldValidate: true });
    setShowWilayaDropdown(false);
    setWilayaSearch("");
  };

  const clearWilaya = () => {
    setValue("address.city", "", { shouldValidate: true });
    setWilayaSearch("");
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

      let result;
      if (client) {
        result = await updateMutation.mutateAsync({
          id: client.id,
          data: apiData,
        });
      } else {
        result = await createMutation.mutateAsync(apiData);
      }

      handleClose();

      // Call onSuccess callback if provided
      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleClose = () => {
    reset();
    setWilayaSearch("");
    setShowWilayaDropdown(false);
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
              Adresse 
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

              <div className="relative">
                <Label htmlFor="address.city">Wilaya</Label>
                <div className="relative">
                  <Input
                    id="address.city"
                    value={selectedCity || ""}
                    placeholder="Sélectionner une wilaya"
                    readOnly
                    onFocus={() => setShowWilayaDropdown(true)}
                  />
                  {selectedCity && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearWilaya}
                      className="absolute right-8 top-0 h-full px-2"
                    >
                      ×
                    </Button>
                  )}
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>

                {showWilayaDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {/* Search input inside dropdown */}
                    <div className="p-2 border-b">
                      <Input
                        placeholder="Rechercher une wilaya..."
                        value={wilayaSearch}
                        onChange={(e) => setWilayaSearch(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Wilayas list */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredWilayas.length > 0 ? (
                        filteredWilayas.map((wilaya) => (
                          <div
                            key={wilaya}
                            className={`p-2 cursor-pointer hover:bg-gray-100 ${
                              selectedCity === wilaya
                                ? "bg-blue-50 text-blue-600"
                                : ""
                            }`}
                            onClick={() => selectWilaya(wilaya)}
                          >
                            {wilaya}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Aucune wilaya trouvée
                        </div>
                      )}
                    </div>
                  </div>
                )}
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

        {/* Close dropdown when clicking outside */}
        {showWilayaDropdown && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowWilayaDropdown(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
