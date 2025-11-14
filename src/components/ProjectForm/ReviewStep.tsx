import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEmployers } from "@/hooks/useEmployers";
import { FileText } from "lucide-react";
import { generateInvoicePDF } from "@/lib/invoicePDFGenerator";

interface ReviewStepProps {
  onSubmit: () => void;
  onBack: () => void;
  client: any;
  employers: string[];
  projectData?: any;
  invoiceData?: any;
  isUpdate?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onSubmit,
  onBack,
  client,
  employers,
  projectData,
  invoiceData,
  isUpdate = false,
}) => {
  const { data: employersData } = useEmployers();

  const selectedEmployersDetails = employersData?.results?.filter((emp: any) =>
    employers.includes(emp.id)
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-800" },
      ISSUED: { label: "Émise", color: "bg-blue-100 text-blue-800" },
      PAID: { label: "Payée", color: "bg-green-100 text-green-800" },
      CANCELLED: { label: "Annulée", color: "bg-red-100 text-red-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const generatePDF = (type: string) => {
    if (!invoiceData || !client || !projectData) return;

    generateInvoicePDF(type, invoiceData, client, projectData);
  };

  const hasInvoiceData =
    invoiceData &&
    (invoiceData.invoice.bon_de_commande ||
      invoiceData.invoice.bon_de_versement ||
      invoiceData.invoice.bon_de_livraison ||
      invoiceData.invoice.facture ||
      invoiceData.invoice.facture_proforma ||
      invoiceData.invoice.deposit_price > 0 ||
      invoiceData.lines.length > 0);

  // Format address for display
  const formatAddress = (address: any) => {
    if (!address) return "";

    if (typeof address === "string") {
      return address;
    }

    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.province) parts.push(address.province);
    if (address.postal_code) parts.push(address.postal_code);

    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Revue Finale</h3>
        <p className="text-sm text-gray-600">
          Vérifiez toutes les informations avant de{" "}
          {isUpdate ? "modifier" : "créer"} le projet
        </p>
      </div>

      {/* PDF Generation Buttons */}
      {hasInvoiceData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Générer les Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => generatePDF("bon_de_commande")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Bon de Commande</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => generatePDF("facture_proforma")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Facture Proforma</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => generatePDF("facture")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Facture</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => generatePDF("bon_de_versement")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Bon de Versement</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => generatePDF("bon_de_livraison")}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Bon de Livraison</span>
              </Button>
            </div>

            {/* Document Descriptions */}
            
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Nom:</strong> {client?.name}
            </div>
            <div>
              <strong>Email:</strong> {client?.email || "Non spécifié"}
            </div>
            <div>
              <strong>Téléphone:</strong>{" "}
              {client?.phone_number || "Non spécifié"}
            </div>

            {/* Corporate Information */}
            {client?.is_corporate && (
              <>
                {client?.rc && (
                  <div>
                    <strong>RC:</strong> {client.rc}
                  </div>
                )}
                {client?.nif && (
                  <div>
                    <strong>NIF:</strong> {client.nif}
                  </div>
                )}
                {client?.nis && (
                  <div>
                    <strong>NIS:</strong> {client.nis}
                  </div>
                )}
                {client?.ai && (
                  <div>
                    <strong>AI:</strong> {client.ai}
                  </div>
                )}
                {client?.art && (
                  <div>
                    <strong>ART:</strong> {client.art}
                  </div>
                )}
                {client?.account_number && (
                  <div>
                    <strong>Compte Bancaire:</strong> {client.account_number}
                  </div>
                )}
                {client?.fax && (
                  <div>
                    <strong>Fax:</strong> {client.fax}
                  </div>
                )}
              </>
            )}

            {/* Address Information */}
            {client?.address && (
              <div>
                <strong>Adresse:</strong>
                <div className="text-sm mt-1">
                  {formatAddress(client.address)}
                </div>
              </div>
            )}

            {/* Client Type */}
            <div>
              <strong>Type:</strong>{" "}
              {client?.is_corporate ? "Entreprise" : "Particulier"}
            </div>

            {/* Notes */}
            {client?.notes && (
              <div>
                <strong>Notes:</strong>
                <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
                  {client.notes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Information */}
        {projectData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Nom:</strong> {projectData.name}
              </div>
              <div>
                <strong>Date de début:</strong>{" "}
                {new Date(projectData.start_date).toLocaleDateString("fr-FR")}
              </div>
              {projectData.end_date && (
                <div>
                  <strong>Date de fin:</strong>{" "}
                  {new Date(projectData.end_date).toLocaleDateString("fr-FR")}
                </div>
              )}

              {/* Warranty Information */}
              {(projectData.warranty_years > 0 ||
                projectData.warranty_months > 0 ||
                projectData.warranty_days > 0) && (
                <div>
                  <strong>Garantie:</strong>
                  <div className="text-sm mt-1">
                    {projectData.warranty_years > 0 &&
                      `${projectData.warranty_years} an(s) `}
                    {projectData.warranty_months > 0 &&
                      `${projectData.warranty_months} mois `}
                    {projectData.warranty_days > 0 &&
                      `${projectData.warranty_days} jour(s)`}
                  </div>
                </div>
              )}

              {/* Maintenance Information */}
              {(projectData.duration_maintenance !== null ||
                projectData.interval_maintenance !== null) && (
                <div>
                  <strong>Maintenance:</strong>
                  <div className="text-sm mt-1">
                    {projectData.duration_maintenance !== null && (
                      <div>Durée: {projectData.duration_maintenance} mois</div>
                    )}
                    {projectData.interval_maintenance !== null && (
                      <div>Intervalle: {projectData.interval_maintenance}</div>
                    )}
                  </div>
                </div>
              )}

              {projectData.description && (
                <div>
                  <strong>Description:</strong>
                  <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
                    {projectData.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employers Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employés Assignés</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmployersDetails?.length > 0 ? (
              <div className="space-y-3">
                {selectedEmployersDetails.map((employer: any) => (
                  <div
                    key={employer.id}
                    className="flex justify-between items-center p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {employer.first_name && employer.last_name
                          ? `${employer.first_name} ${employer.last_name}`
                          : employer.username}
                      </div>
                      {employer.email && (
                        <div className="text-sm text-gray-600">
                          {employer.email}
                        </div>
                      )}
                    </div>
                    {employer.group && (
                      <Badge variant="outline">{employer.group}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 p-2 text-center">
                Aucun employé assigné
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Information */}
        {invoiceData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <strong>Statut:</strong>
                {getStatusBadge(invoiceData.invoice.status)}
              </div>

              {invoiceData.invoice.bon_de_commande && (
                <div>
                  <strong>Bon de commande:</strong>{" "}
                  {invoiceData.invoice.bon_de_commande}
                </div>
              )}

              {invoiceData.invoice.facture_proforma && (
                <div>
                  <strong>Facture Proforma:</strong>{" "}
                  {invoiceData.invoice.facture_proforma}
                </div>
              )}

              {invoiceData.invoice.facture && (
                <div>
                  <strong>Facture:</strong> {invoiceData.invoice.facture}
                </div>
              )}

              {invoiceData.invoice.due_date && (
                <div>
                  <strong>Échéance:</strong>{" "}
                  {new Date(invoiceData.invoice.due_date).toLocaleDateString(
                    "fr-FR"
                  )}
                </div>
              )}

              {invoiceData.invoice.deposit_price > 0 && (
                <div>
                  <strong>Acompte:</strong> {invoiceData.invoice.deposit_price}{" "}
                  DA
                </div>
              )}

              {/* Invoice Lines Summary */}
              {invoiceData.lines.length > 0 && (
                <div className="pt-2 border-t">
                  <strong>Lignes de facture:</strong>
                  <div className="mt-3 space-y-2">
                    {invoiceData.lines.map((line: any, index: number) => (
                      <div
                        key={line.id || index}
                        className="text-sm p-2 border rounded flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {index + 1}. {line.product || "Sans nom"}
                          </div>
                          {line.description && (
                            <div className="text-gray-600 mt-1">
                              {line.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Qté: {line.quantity} × {line.unit_price} DA
                            {line.discount > 0 &&
                              ` - Remise: ${line.discount} DA`}
                          </div>
                        </div>
                        <div className="font-semibold ml-4">
                          {Number(line.line_total || 0).toFixed(2)} DA
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-3 pt-3 font-bold flex justify-between text-lg">
                    <span>Total:</span>
                    <span>
                      {invoiceData.lines
                        .reduce(
                          (sum: number, line: any) =>
                            sum + Number(line.line_total || 0),
                          0
                        )
                        .toFixed(2)}{" "}
                      DA
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onSubmit}>
          {isUpdate ? "Modifier le Projet" : "Créer le Projet"}
        </Button>
      </div>
    </div>
  );
};
