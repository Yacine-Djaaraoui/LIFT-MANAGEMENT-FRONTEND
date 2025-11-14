import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const projectSchema = yup.object({
  name: yup.string().required("Le nom du projet est requis"),
  start_date: yup.string().required("La date de début est requise"),
  end_date: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  description: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .optional(),
  warranty_years: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
  warranty_months: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
  warranty_days: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? 0 : value))
    .min(0)
    .default(0),
  duration_maintenance: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? null : value))
    .min(0)
    .max(9223372036854776000)
    .nullable()
    .default(null),
  interval_maintenance: yup
    .number()
    .transform((value) => (isNaN(value) || value === "" ? null : value))
    .min(0)
    .max(9223372036854776000)
    .nullable()
    .default(null),
});

type ProjectFormData = yup.InferType<typeof projectSchema>;

interface ProjectStepProps {
  onNext: (data: ProjectFormData) => void;
  onBack: () => void;
  initialData?: any;
}

export const ProjectStep: React.FC<ProjectStepProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
      description: "",
      warranty_years: 0,
      warranty_months: 0,
      warranty_days: 0,
      duration_maintenance: null,
      interval_maintenance: null,
    },
  });

  // Reset form with initial data when it changes
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
        description: initialData.description || "",
        warranty_years: initialData.warranty_years || 0,
        warranty_months: initialData.warranty_months || 0,
        warranty_days: initialData.warranty_days || 0,
        duration_maintenance: initialData.duration_maintenance || null,
        interval_maintenance: initialData.interval_maintenance || null,
      });
    }
  }, [initialData, reset]);

  const onSubmit = (data: ProjectFormData) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Détails du Projet</h3>
        <p className="text-sm text-gray-600">
          Renseignez les informations concernant le projet
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">
            Nom du Projet <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex: Installation ascenseur résidence Les Pins"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">
              Date de Début <span className="text-red-500">*</span>
            </Label>
            <Input id="start_date" type="date" {...register("start_date")} />
            {errors.start_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.start_date.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="end_date">
              Date de Fin <span className="text-gray-500">(Optionnel)</span>
            </Label>
            <Input id="end_date" type="date" {...register("end_date")} />
            {errors.end_date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Warranty Duration */}
        <div className="space-y-4">
          <Label>
            Durée de Garantie <span className="text-gray-500">(Optionnel)</span>
          </Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="warranty_years" className="text-sm">
                Années
              </Label>
              <Input
                id="warranty_years"
                type="number"
                min="0"
                {...register("warranty_years", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="warranty_months" className="text-sm">
                Mois
              </Label>
              <Input
                id="warranty_months"
                type="number"
                min="0"
                max="11"
                {...register("warranty_months", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="warranty_days" className="text-sm">
                Jours
              </Label>
              <Input
                id="warranty_days"
                type="number"
                min="0"
                max="30"
                {...register("warranty_days", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration_maintenance">
              Durée de Maintenance (mois){" "}
              <span className="text-gray-500">(Optionnel)</span>
            </Label>
            <Input
              id="duration_maintenance"
              type="number"
              min="0"
              {...register("duration_maintenance", { valueAsNumber: true })}
              placeholder="Durée du contrat de maintenance en mois"
            />
            <p className="text-xs text-gray-500 mt-1">
              Durée du contrat de maintenance en mois
            </p>
            {errors.duration_maintenance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.duration_maintenance.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="interval_maintenance">
              Intervalle de Maintenance{" "}
              <span className="text-gray-500">(Optionnel)</span>
            </Label>
            <Input
              id="interval_maintenance"
              type="number"
              min="0"
              {...register("interval_maintenance", { valueAsNumber: true })}
              placeholder="Intervalle de maintenance"
            />
            {errors.interval_maintenance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.interval_maintenance.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">
            Description du Projet{" "}
            <span className="text-gray-500">(Optionnel)</span>
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Décrivez les travaux à réaliser..."
            rows={4}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Retour
          </Button>
          <Button type="submit">Continuer</Button>
        </div>
      </form>
    </div>
  );
};
