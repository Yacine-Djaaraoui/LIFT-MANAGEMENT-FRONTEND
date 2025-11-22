import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/useAuth";
import { AlertCircle, CheckCircle } from "lucide-react";

// Make optional fields truly optional with proper transformation
const productSchema = yup.object({
  name: yup.string().required("Le nom du produit est requis"),
  sku: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  quantity: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
  unit: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  reorder_threshold: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 10 : value))
    .min(0)
    .default(10),
  buying_price: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
  selling_price: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
});

type ProductFormData = yup.InferType<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSuccess,
  product,
}) => {
  const { data: user } = useCurrentUser();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
  } = useForm<ProductFormData>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      quantity: 0,
      unit: "",
      reorder_threshold: 10,
      buying_price: 0,
      selling_price: 0,
    },
  });

  const buyingPrice = watch("buying_price") || 0;
  const sellingPrice = watch("selling_price") || 0;

  const profitPerUnit = sellingPrice - buyingPrice;
  const profitMargin =
    buyingPrice > 0 ? (profitPerUnit / buyingPrice) * 100 : 0;

  // Reset form with product data when product changes or dialog opens
  useEffect(() => {
    if (open && product) {
      reset({
        name: product.name || "",
        sku: product.sku || "",
        quantity: product.quantity || 0,
        unit: product.unit || "",
        reorder_threshold: product.reorder_threshold || 10,
        buying_price: parseFloat(product.buying_price) || 0,
        selling_price: parseFloat(product.selling_price) || 0,
      });
    } else if (open && !product) {
      // Reset to empty values for new product
      reset({
        name: "",
        sku: "",
        quantity: 0,
        unit: "",
        reorder_threshold: 10,
        buying_price: 0,
        selling_price: 0,
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Prepare data for API - convert empty strings to null for optional fields
      const apiData: any = {
        name: data.name,
        quantity: data.quantity,
        reorder_threshold: data.reorder_threshold,
        buying_price: data.buying_price,
        selling_price: data.selling_price,
      };

      // Only include optional fields if they have values
      if (data.sku) apiData.sku = data.sku;
      if (data.unit) apiData.unit = data.unit;

      if (product) {
        // For update, only send changed fields
        const updateData: any = {};
        if (data.name !== product.name) updateData.name = data.name;
        if (data.sku !== product.sku) updateData.sku = data.sku || null;
        if (data.quantity !== product.quantity)
          updateData.quantity = data.quantity;
        if (data.unit !== product.unit) updateData.unit = data.unit || null;
        if (data.reorder_threshold !== product.reorder_threshold)
          updateData.reorder_threshold = data.reorder_threshold;
        if (data.buying_price !== parseFloat(product.buying_price))
          updateData.buying_price = data.buying_price;
        if (data.selling_price !== parseFloat(product.selling_price))
          updateData.selling_price = data.selling_price;

        await updateMutation.mutateAsync({
          id: product.id,
          data: updateData,
        });
      } else {
        await createMutation.mutateAsync(apiData);
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (error: any) {
      // Handle backend validation errors
      const backendErrors = error?.response?.data;

      if (backendErrors) {
        // Set form errors for field-specific validation
        Object.keys(backendErrors).forEach((field) => {
          if (field in productSchema.fields) {
            setError(field as keyof ProductFormData, {
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
            (field) => field in productSchema.fields
          )
        ) {
          const generalError =
            backendErrors.message ||
            backendErrors.detail ||
            "Une erreur est survenue";
          // Set a general form error
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
  const currentMutation = product ? updateMutation : createMutation;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product
              ? `Modifier le Produit: ${product.name}`
              : "Créer un Nouveau Produit"}
          </DialogTitle>
        </DialogHeader>

        {/* General Error Alert */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{errors.root.message}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {currentMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm">
                {product
                  ? "Produit modifié avec succès"
                  : "Produit créé avec succès"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Nom du Produit <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Nom du produit"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="sku">
                SKU/Code <span className="text-gray-500">(Optionnel)</span>
              </Label>
              <Input
                id="sku"
                {...register("sku")}
                placeholder="Code du produit"
                disabled={isLoading}
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.sku.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">
                Unité <span className="text-gray-500">(Optionnel)</span>
              </Label>
              <Input
                id="unit"
                {...register("unit")}
                placeholder="Ex: pièce, mètre, kg"
                disabled={isLoading}
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.unit.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity">Quantité en Stock</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reorder_threshold">Seuil d'Alerte</Label>
              <Input
                id="reorder_threshold"
                type="number"
                min="0"
                {...register("reorder_threshold", { valueAsNumber: true })}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-600 mt-1">
                Alerte lorsque le stock est inférieur ou égal à ce nombre
              </p>
              {errors.reorder_threshold && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reorder_threshold.message}
                </p>
              )}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de Prix</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.can_see_selling_price && (
                <div>
                  <Label htmlFor="buying_price">Prix d'Achat (DA)</Label>
                  <Input
                    disabled={!user?.can_edit_selling_price || isLoading}
                    id="buying_price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("buying_price", { valueAsNumber: true })}
                  />
                  {errors.buying_price && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.buying_price.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="selling_price">Prix de Vente (DA)</Label>
                <Input
                  disabled={!user?.can_edit_buying_price || isLoading}
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("selling_price", { valueAsNumber: true })}
                />
                {errors.selling_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.selling_price.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Information */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Champs obligatoires
            </p>
          </div>

          {/* Actions */}
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
                ? product
                  ? "Modification..."
                  : "Création..."
                : product
                ? "Modifier"
                : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
