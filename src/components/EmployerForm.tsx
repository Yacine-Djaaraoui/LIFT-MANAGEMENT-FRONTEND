import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateEmployer, useUpdateEmployer } from "@/hooks/useEmployers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

// Updated schema with all fields as optional for updates
const employerSchema = yup.object({
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
  group: yup.string().nullable().optional(),
});

type EmployerFormData = yup.InferType<typeof employerSchema>;

interface EmployerFormProps {
  open: boolean;
  onClose: () => void;
  employer?: any;
  onSuccess?: (message: string) => void;
}

export const EmployerForm: React.FC<EmployerFormProps> = ({
  open,
  onClose,
  employer,
  onSuccess,
}) => {
  const createMutation = useCreateEmployer();
  const updateMutation = useUpdateEmployer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
  } = useForm<EmployerFormData>({
    resolver: yupResolver(employerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone_number: "",
      password: "",
      first_name: "",
      last_name: "",
      wilaya: "",
      group: "",
    },
  });

  // Reset and pre-fill form when employer changes or dialog opens
  useEffect(() => {
    if (open && employer) {
      console.log("Pre-filling form with employer data:", employer);

      // Pre-fill all fields with current employer data
      setValue("username", employer.username || "");
      setValue("email", employer.email || "");
      setValue("phone_number", employer.phone_number || "");
      setValue("first_name", employer.first_name || "");
      setValue("last_name", employer.last_name || "");
      setValue("wilaya", employer.wilaya || "");
      setValue("group", employer.group || "");
      // Don't pre-fill password for security reasons
      setValue("password", "");
    } else if (open && !employer) {
      // Reset form for new employer
      reset({
        username: "",
        email: "",
        phone_number: "",
        password: "",
        first_name: "",
        last_name: "",
        wilaya: "",
        group: "",
      });
    }
  }, [open, employer, reset, setValue]);

  const onSubmit = async (data: EmployerFormData) => {
    try {
      // Prepare data for submission - only include changed fields
      const submitData: any = {};

      let result;
      let successMessage = "";

      // For update: only include fields that have been changed and are not empty
      if (employer) {
        if (data.username && data.username !== employer.username) {
          submitData.username = data.username;
        }
        if (data.email !== employer.email) {
          submitData.email = data.email || null; // Allow setting to null/empty
        }
        if (data.phone_number !== employer.phone_number) {
          submitData.phone_number = data.phone_number || null;
        }
        if (data.first_name !== employer.first_name) {
          submitData.first_name = data.first_name || null;
        }
        if (data.last_name !== employer.last_name) {
          submitData.last_name = data.last_name || null;
        }
        if (data.wilaya !== employer.wilaya) {
          submitData.wilaya = data.wilaya || null;
        }
        if (data.group !== employer.group) {
          submitData.group = data.group || null;
        }
        // Only include password if provided
        if (data.password && data.password.trim() !== "") {
          submitData.password = data.password;
        }

        console.log("Updating employer with data:", submitData);

        // Only call update if there are changes
        if (Object.keys(submitData).length > 0) {
          console.log("dkhol b ", submitData);
          result = await updateMutation.mutateAsync({
            id: employer.id,
            data: submitData,
          });
          successMessage = "Employé modifié avec succès";
        } else {
          console.log("No changes detected");
          handleClose();
          return;
        }
      } else {
        // For create: include all required fields
        const createData: any = {
          username: data.username || "",
          password: data.password || "",
        };

        // Include optional fields only if they have values
        if (data.email) createData.email = data.email;
        if (data.phone_number) createData.phone_number = data.phone_number;
        if (data.first_name) createData.first_name = data.first_name;
        if (data.last_name) createData.last_name = data.last_name;
        if (data.wilaya) createData.wilaya = data.wilaya;
        if (data.group) createData.group = data.group;

        console.log("Creating employer with data:", createData);
        result = await createMutation.mutateAsync(createData);
        successMessage = "Employé créé avec succès";
      }

      handleClose();

      // Call onSuccess callback if provided
      if (onSuccess && result) {
        onSuccess(successMessage);
      }
    } catch (error: any) {
      // Handle backend validation errors
      const backendErrors = error?.response?.data;

      if (backendErrors) {
        // Set form errors for field-specific validation
        Object.keys(backendErrors).forEach((field) => {
          if (field in employerSchema.fields) {
            setError(field as keyof EmployerFormData, {
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
            (field) => field in employerSchema.fields
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employer ? "Modifier l'Employé" : "Créer un Nouvel Employé"}
          </DialogTitle>
        </DialogHeader>

        {/* General Error Alert */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{errors.root.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">
                Nom d'utilisateur {!employer && "*"}
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
              {employer && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Mot de passe {!employer && "*"}</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder={employer ? "Nouveau mot de passe" : "Mot de passe"}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
              {employer && (
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
              {employer && (
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
              {employer && (
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
              {employer && (
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
              {employer && (
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
              {employer && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="group">Groupe</Label>
              <Input
                id="group"
                {...register("group")}
                placeholder="Groupe d'affectation"
                disabled={isLoading}
              />
              {employer && (
                <p className="text-xs text-gray-500 mt-1">
                  Laisser vide pour garder la valeur actuelle
                </p>
              )}
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
                : employer
                ? "Modifier"
                : "Créer"}
            </Button>
          </div>

          {employer && (
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
