import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateAssistant, useUpdateAssistant } from "@/hooks/useAssistants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle } from "lucide-react";

const assistantSchema = yup.object({
  username: yup.string().optional(),
  email: yup.string().email("Email invalide").nullable().optional(),
  phone_number: yup.string().nullable().optional(),
  password: yup
    .string()
    .optional()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  first_name: yup.string().nullable().optional(),
  last_name: yup.string().nullable().optional(),
  wilaya: yup.string().nullable().optional(),
  can_see_selling_price: yup.boolean().default(false),
  can_edit_selling_price: yup.boolean().default(false),
  can_edit_buying_price: yup.boolean().default(false),
});

type AssistantFormData = yup.InferType<typeof assistantSchema>;

interface AssistantFormProps {
  open: boolean;
  onClose: () => void;
  assistant?: any;
  onSuccess?: () => void;
}

export const AssistantForm: React.FC<AssistantFormProps> = ({
  open,
  onClose,
  assistant,
  onSuccess,
}) => {
  const createMutation = useCreateAssistant();
  const updateMutation = useUpdateAssistant();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<AssistantFormData>({
    resolver: yupResolver(assistantSchema),
    defaultValues: {
      username: "",
      email: "",
      phone_number: "",
      password: "",
      first_name: "",
      last_name: "",
      wilaya: "",
      can_see_selling_price: false,
      can_edit_selling_price: false,
      can_edit_buying_price: false,
    },
  });

  // Watch the permission fields
  const canSeeSellingPrice = watch("can_see_selling_price");
  const canEditSellingPrice = watch("can_edit_selling_price");
  const canEditBuyingPrice = watch("can_edit_buying_price");

  // Reset and pre-fill form when assistant changes or dialog opens
  useEffect(() => {
    if (open && assistant) {
      console.log("Pre-filling form with assistant data:", assistant);

      // Pre-fill all fields with current assistant data
      setValue("username", assistant.username || "");
      setValue("email", assistant.email || "");
      setValue("phone_number", assistant.phone_number || "");
      setValue("first_name", assistant.first_name || "");
      setValue("last_name", assistant.last_name || "");
      setValue("wilaya", assistant.wilaya || "");

      // Set permission fields - ensure they are boolean
      setValue(
        "can_see_selling_price",
        Boolean(assistant.can_see_selling_price)
      );
      setValue(
        "can_edit_selling_price",
        Boolean(assistant.can_edit_selling_price)
      );
      setValue(
        "can_edit_buying_price",
        Boolean(assistant.can_edit_buying_price)
      );

      // Don't pre-fill password for security reasons
      setValue("password", "");
    } else if (open && !assistant) {
      // Reset form for new assistant
      reset({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        first_name: "",
        last_name: "",
        wilaya: "",
        can_see_selling_price: false,
        can_edit_selling_price: false,
        can_edit_buying_price: false,
      });
    }
  }, [open, assistant, reset, setValue]);

  // Handle checkbox changes properly
  const handleCheckboxChange = (
    field: keyof AssistantFormData,
    checked: boolean
  ) => {
    setValue(field, checked, { shouldValidate: true });
  };

  const onSubmit = async (data: AssistantFormData) => {
    try {
      console.log("Form submitted with data:", data);
      console.log("Permission values:", {
        can_see_selling_price: data.can_see_selling_price,
        can_edit_selling_price:
          data.can_edit_selling_price && data.can_see_selling_price,
        can_edit_buying_price: data.can_edit_buying_price,
      });

      let result;
      if (assistant) {
        // UPDATE MODE - Send only changed fields
        const submitData: any = {};

        // Check each field for changes
        if (data.username && data.username !== assistant.username) {
          submitData.username = data.username;
        }
        if (data.email !== assistant.email) {
          submitData.email = data.email || null;
        }
        if (data.phone_number !== assistant.phone_number) {
          submitData.phone_number = data.phone_number || null;
        }
        if (data.first_name !== assistant.first_name) {
          submitData.first_name = data.first_name || null;
        }
        if (data.last_name !== assistant.last_name) {
          submitData.last_name = data.last_name || null;
        }
        if (data.wilaya !== assistant.wilaya) {
          submitData.wilaya = data.wilaya || null;
        }

        // Permission fields - always send if they exist in the form
        submitData.can_see_selling_price = Boolean(data.can_see_selling_price);
        submitData.can_edit_selling_price = Boolean(
          data.can_edit_selling_price && data.can_see_selling_price
        );
        submitData.can_edit_buying_price = Boolean(data.can_edit_buying_price);

        // Password - only if provided
        if (data.password && data.password.trim() !== "") {
          submitData.password = data.password;
        }

        console.log("Updating assistant with data:", submitData);

        result = await updateMutation.mutateAsync({
          id: assistant.id,
          data: submitData,
        });
      } else {
        // CREATE MODE - Send all required fields
        const createData: any = {
          username: data.username || "",
          password: data.password || "",
          can_see_selling_price: Boolean(data.can_see_selling_price),
          can_edit_selling_price: Boolean(
            data.can_edit_selling_price && data.can_see_selling_price
          ),
          can_edit_buying_price: Boolean(data.can_edit_buying_price),
        };

        // Include optional fields only if they have values
        if (data.email) createData.email = data.email;
        if (data.phone_number) createData.phone_number = data.phone_number;
        if (data.first_name) createData.first_name = data.first_name;
        if (data.last_name) createData.last_name = data.last_name;
        if (data.wilaya) createData.wilaya = data.wilaya;

        console.log("Creating assistant with data:", createData);
        result = await createMutation.mutateAsync(createData);
      }

      handleClose();

      // Call onSuccess callback if provided
      if (onSuccess && result) {
        onSuccess();
      }
    } catch (error: any) {
      // Handle backend validation errors
      const backendErrors = error?.response?.data;

      if (backendErrors) {
        // Set form errors for field-specific validation
        Object.keys(backendErrors).forEach((field) => {
          if (field in assistantSchema.fields) {
            setError(field as keyof AssistantFormData, {
              type: "server",
              message: Array.isArray(backendErrors[field])
                ? backendErrors[field][0]
                : backendErrors[field],
            });
          }
        });

        // Show general error message if no field-specific errors
        if (
          !Object.keys(backendErrors).some(
            (field) => field in assistantSchema.fields
          )
        ) {
          const generalError =
            backendErrors.message ||
            backendErrors.detail ||
            "Une erreur est survenue lors de l'enregistrement";
          setError("root", {
            type: "server",
            message: generalError,
          });
        }
      } else {
        // Handle network or other errors
        setError("root", {
          type: "server",
          message: error?.message || "Une erreur réseau est survenue",
        });
      }
    }
  };

  const handleClose = () => {
    // Reset mutations when closing
    createMutation.reset();
    updateMutation.reset();
    reset();
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const currentMutation = assistant ? updateMutation : createMutation;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {assistant ? "Modifier l'Assistant" : "Créer un Nouvel Assistant"}
          </DialogTitle>
        </DialogHeader>

        {/* General Error Alert */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        )}

        {/* Success Message */}
        {currentMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">
              {assistant
                ? "Assistant modifié avec succès"
                : "Assistant créé avec succès"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">
                Nom d'utilisateur {!assistant && "*"}
              </Label>
              <Input
                id="username"
                {...register("username")}
                placeholder="Nom d'utilisateur"
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe {!assistant && "*"}</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder={
                  assistant ? "Nouveau mot de passe" : "Mot de passe"
                }
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder le mot de passe actuel
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="email@exemple.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone_number">Téléphone</Label>
              <Input
                id="phone_number"
                {...register("phone_number")}
                placeholder="Numéro de téléphone"
                disabled={isLoading}
              />
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                {...register("first_name")}
                placeholder="Prénom"
                disabled={isLoading}
              />
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                {...register("last_name")}
                placeholder="Nom"
                disabled={isLoading}
              />
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="wilaya">Wilaya</Label>
              <Input
                id="wilaya"
                {...register("wilaya")}
                placeholder="Wilaya"
                disabled={isLoading}
              />
              {assistant && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>
          </div>

          {/* Permissions Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Permissions</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_see_selling_price"
                  checked={canSeeSellingPrice}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "can_see_selling_price",
                      checked as boolean
                    )
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="can_see_selling_price"
                  className="cursor-pointer"
                >
                  Peut voir le prix de vente
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_edit_selling_price"
                  checked={canEditSellingPrice}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "can_edit_selling_price",
                      checked as boolean
                    )
                  }
                  disabled={!canSeeSellingPrice || isLoading}
                />
                <Label
                  htmlFor="can_edit_selling_price"
                  className={`cursor-pointer ${
                    !canSeeSellingPrice ? "text-gray-400" : ""
                  }`}
                >
                  Peut modifier le prix de vente
                </Label>
                {!canSeeSellingPrice && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Nécessite "Peut voir le prix de vente")
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_edit_buying_price"
                  checked={canEditBuyingPrice}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "can_edit_buying_price",
                      checked as boolean
                    )
                  }
                  disabled={isLoading}
                />
                <Label
                  htmlFor="can_edit_buying_price"
                  className="cursor-pointer"
                >
                  Peut modifier le prix d'achat
                </Label>
              </div>
            </div>

            {/* Permissions Help Text */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note sur les permissions :</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>
                    "Peut modifier le prix de vente" nécessite "Peut voir le
                    prix de vente"
                  </li>
                  <li>
                    La modification du prix d'achat est une permission sensible
                  </li>
                  <li>
                    Ces permissions affectent l'accès aux données sensibles dans
                    le stock
                  </li>
                </ul>
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Enregistrement..."
                : assistant
                ? "Modifier"
                : "Créer"}
            </Button>
          </div>

          {assistant && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note :</strong> Vous pouvez modifier uniquement les
                champs que vous souhaitez changer. Les champs laissés vides
                conserveront leurs valeurs actuelles.
              </p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
