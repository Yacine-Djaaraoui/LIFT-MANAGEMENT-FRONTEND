import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import {
  useMaintenances,
  useCreateMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
} from "@/hooks/useMaintenances";

interface MaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export const MaintenanceDialog: React.FC<MaintenanceDialogProps> = ({
  open,
  onClose,
  projectId,
  projectName,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMaintenance, setEditingMaintenance] =
    useState<Maintenance | null>(null);
  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
  });

  const { data: maintenancesData, isLoading } = useMaintenances({
    project: projectId,
    ordering: "start_date",
  });

  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const deleteMutation = useDeleteMaintenance();

  const maintenances = maintenancesData?.results || maintenancesData || [];

  useEffect(() => {
    if (!open) {
      setIsCreating(false);
      setEditingMaintenance(null);
      setFormData({ start_date: "", end_date: "" });
    }
  }, [open]);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingMaintenance(null);
    setFormData({ start_date: "", end_date: "" });
  };

  const handleEdit = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setIsCreating(false);
    setFormData({
      start_date: maintenance.start_date,
      end_date: maintenance.end_date,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingMaintenance(null);
    setFormData({ start_date: "", end_date: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.start_date || !formData.end_date) {
      return;
    }

    try {
      if (editingMaintenance && editingMaintenance.id) {
        await updateMutation.mutateAsync({
          id: editingMaintenance.id,
          data: formData,
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          project: parseInt(projectId),
        });
      }

      handleCancel();
    } catch (error) {
      console.error("Error saving maintenance:", error);
    }
  };

  const handleDelete = async (maintenance: Maintenance) => {
    if (!maintenance.id) return;

    try {
      await deleteMutation.mutateAsync(maintenance.id);
    } catch (error) {
      console.error("Error deleting maintenance:", error);
    }
  };

  const getStatusBadge = (maintenance: Maintenance) => {
    if (maintenance.is_overdue) {
      return <Badge className="bg-red-100 text-red-800">En retard</Badge>;
    } else if (maintenance.days_until_maintenance <= 7) {
      return <Badge className="bg-orange-100 text-orange-800">Proche</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Planifié</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestion des Maintenances - {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Maintenance Form */}
          {(isCreating || editingMaintenance) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-4">
                {editingMaintenance
                  ? "Modifier la Maintenance"
                  : "Nouvelle Maintenance"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Date de Début</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">Date de Fin</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {editingMaintenance ? "Modifier" : "Créer"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Add Maintenance Button */}
          {!isCreating && !editingMaintenance && (
            <Button
              onClick={handleCreate}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Maintenance</span>
            </Button>
          )}

          {/* Maintenances Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Date de Début</TableHead>
                  <TableHead>Date de Fin</TableHead>
                  <TableHead>Jours Restants</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : maintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Aucune maintenance planifiée
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenances.map((maintenance: Maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell className="font-medium">
                        #{maintenance.maintenance_number}
                      </TableCell>
                      <TableCell>
                        {new Date(maintenance.start_date).toLocaleDateString(
                          "fr-FR"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(maintenance.end_date).toLocaleDateString(
                          "fr-FR"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            {maintenance.days_until_maintenance} jours
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(maintenance)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(maintenance)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(maintenance)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary Statistics */}
          {maintenances.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {maintenances.length}
                </div>
                <div className="text-sm text-blue-800">
                  Maintenances totales
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {
                    maintenances.filter(
                      (m: Maintenance) => m.days_until_maintenance <= 7
                    ).length
                  }
                </div>
                <div className="text-sm text-orange-800">
                  À venir (≤ 7 jours)
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {maintenances.filter((m: Maintenance) => m.is_overdue).length}
                </div>
                <div className="text-sm text-red-800">En retard</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
