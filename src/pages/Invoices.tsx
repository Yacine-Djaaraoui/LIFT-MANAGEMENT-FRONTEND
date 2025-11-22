import React, { useState } from "react";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { useUpdateInvoiceStatus } from "@/hooks/useInvoices";
import {
  Search,
  Trash2,
  FileText,
  CheckCircle,
  Filter,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateInvoicePDF } from "@/lib/invoicePDFGenerator";

export const Invoices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoiceToMarkPaid, setInvoiceToMarkPaid] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState({
    status: "all",
  });

  // Prepare API parameters
  const apiParams = {
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
    // Convert filters to API format
    status: filters.status === "all" ? "" : filters.status,
  };

  const {
    data: invoicesData,
    isLoading,
    error,
    refetch,
  } = useInvoices(apiParams);

  const deleteMutation = useDeleteInvoice();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatus();

  const showMessage = (message: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage("");
    } else {
      setErrorMessage(message);
      setSuccessMessage("");
    }

    // Auto hide after 5 seconds
    setTimeout(() => {
      if (type === "success") {
        setSuccessMessage("");
      } else {
        setErrorMessage("");
      }
    }, 5000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showMessage("Facture supprimée avec succès", "success");
      refetch();
    } catch (error: any) {
      const message =
        error?.message || "Erreur lors de la suppression de la facture";
      showMessage(message, "error");
    }
  };

  const handleMarkAsPaid = async (invoice: any) => {
    try {
      await updateInvoiceStatusMutation.mutateAsync({
        id: invoice.id,
        action: "mark_paid",
      });
      setInvoiceToMarkPaid(null);
      showMessage("Facture marquée comme payée avec succès", "success");
      refetch();
    } catch (error: any) {
      console.error("Error marking invoice as paid:", error);
      const message =
        error?.message || "Erreur lors du marquage de la facture comme payée";
      showMessage(message, "error");
      setInvoiceToMarkPaid(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
    });
    setCurrentPage(1);
  };

  const getStatusBadge = (invoice: any) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      ISSUED: { label: "Émise", color: "bg-blue-100 text-blue-800" },
      PAID: { label: "Payée", color: "bg-green-100 text-green-800" },
    };

    const config =
      statusConfig[invoice.status as keyof typeof statusConfig] ||
      statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const generatePDF = (type: string, invoice: any) => {
    if (!invoice) return;

    // Prepare data for PDF generation with complete client information
    const invoiceData = {
      invoice: {
        bon_de_commande: invoice.bon_de_commande,
        bon_de_versement: invoice.bon_de_versement,
        bon_de_reception: invoice.bon_de_reception,
        facture: invoice.facture,
        facture_proforma: invoice.facture_proforma,
        due_date: invoice.due_date,
        deposit_price: invoice.deposit_price,
        status: invoice.status,
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        tva: invoice.tva,
      },
      lines: invoice.lines || [],
    };

    // Use complete client object from the API response
    const client = invoice.client || {
      name: invoice.client_name,
      email: "",
      phone_number: "",
      address: null,
      is_corporate: false,
      rc: "",
      nif: "",
      nis: "",
      ai: "",
      art: "",
      account_number: "",
      fax: "",
      notes: "",
    };

    const projectData = {
      name: invoice.project_name,
      // Add other project fields if available
    };

    generateInvoicePDF(type, invoiceData, client, projectData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatCurrency = (amount: string) => {
    return `${parseFloat(amount).toFixed(2)} DA`;
  };

  const openDocumentsDialog = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDocumentsDialogOpen(true);
  };

  const hasActiveFilters = filters.status !== "all";

  // Show error from useInvoices hook
  React.useEffect(() => {
    if (error) {
      showMessage(
        error.message || "Erreur lors du chargement des factures",
        "error"
      );
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <X className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Gestion des Factures
        </h1>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher une facture..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {filters.status !== "all" ? 1 : 0}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Filtres</h3>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <Label>Statut de la facture</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="ISSUED">Émise</SelectItem>
                  <SelectItem value="PAID">Payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[120px]">Facture</TableHead>
              <TableHead className="text-left w-[150px]">Client</TableHead>
              <TableHead className="text-left w-[150px]">Projet</TableHead>
              <TableHead className="text-left w-[120px]">Échéance</TableHead>
              <TableHead className="text-left w-[100px]">Montant</TableHead>
              <TableHead className="text-left w-[100px]">Statut</TableHead>
              <TableHead className="text-left w-[120px]">Documents</TableHead>
              <TableHead className="text-left w-[200px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-start space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : invoicesData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              invoicesData?.results?.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-sm text-left">
                    {invoice.facture || `FAC-${invoice.id}`}
                  </TableCell>
                  <TableCell className="text-sm text-left">
                    <div
                      className="max-w-[140px] truncate"
                      title={invoice.client_name}
                    >
                      {invoice.client_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-left">
                    <div
                      className="max-w-[140px] truncate"
                      title={invoice.project_name}
                    >
                      {invoice.project_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-left">
                    {invoice.due_date
                      ? formatDate(invoice.due_date)
                      : "Non spécifiée"}
                  </TableCell>
                  <TableCell className="font-semibold text-sm text-left">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell className="text-left">
                    {getStatusBadge(invoice)}
                  </TableCell>
                  <TableCell className="text-left">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocumentsDialog(invoice)}
                      className="flex items-center space-x-2 h-8"
                    >
                      <Download className="w-4 h-4" />
                      <span>Documents</span>
                    </Button>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center justify-start space-x-2 min-h-[40px]">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center justify-center w-8 h-8 p-0"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer la facture
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer la facture "
                              {invoice.facture || `FAC-${invoice.id}`}" ? Cette
                              action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel
                              disabled={deleteMutation.isPending}
                            >
                              Annuler
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(invoice.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending
                                ? "Suppression..."
                                : "Supprimer"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {invoice.status === "ISSUED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInvoiceToMarkPaid(invoice)}
                          disabled={updateInvoiceStatusMutation.isPending}
                          className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 h-8 text-xs whitespace-nowrap"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Marquer Payée
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Documents Dialog */}
      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Télécharger les documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF("facture_proforma", selectedInvoice)}
              className="flex items-center justify-start space-x-2 w-full h-10"
            >
              <FileText className="w-4 h-4" />
              <span>Facture Proforma</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF("facture", selectedInvoice)}
              className="flex items-center justify-start space-x-2 w-full h-10"
            >
              <FileText className="w-4 h-4" />
              <span>Facture</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF("bon_de_commande", selectedInvoice)}
              className="flex items-center justify-start space-x-2 w-full h-10"
            >
              <FileText className="w-4 h-4" />
              <span>Bon de Commande (BC)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF("bon_de_versement", selectedInvoice)}
              className="flex items-center justify-start space-x-2 w-full h-10"
            >
              <FileText className="w-4 h-4" />
              <span>Bon de Versement (BV)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF("bon_de_livraison", selectedInvoice)}
              className="flex items-center justify-start space-x-2 w-full h-10"
            >
              <FileText className="w-4 h-4" />
              <span>Bon de Livraison (BL)</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {invoicesData && invoicesData.count > 10 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, invoicesData.count)} sur{" "}
            {invoicesData.count} factures
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!invoicesData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Mark as Paid Confirmation Dialog */}
      <AlertDialog
        open={!!invoiceToMarkPaid}
        onOpenChange={() => setInvoiceToMarkPaid(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer la facture comme payée</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              Êtes-vous sûr de vouloir marquer la facture "
              {invoiceToMarkPaid?.facture || `FAC-${invoiceToMarkPaid?.id}`}"
              comme payée ?
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong className="text-yellow-800">Attention:</strong>
                <ul className="list-disc list-inside mt-2 text-yellow-700 space-y-1">
                  <li>Cette action est irréversible</li>
                  <li>La facture sera verrouillée</li>
                  <li>Ajoutée aux statistiques</li>
                  <li>Stock définitivement déduit</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateInvoiceStatusMutation.isPending}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleMarkAsPaid(invoiceToMarkPaid)}
              className="bg-green-600 hover:bg-green-700"
              disabled={updateInvoiceStatusMutation.isPending}
            >
              {updateInvoiceStatusMutation.isPending
                ? "Traitement..."
                : "Confirmer le Paiement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
