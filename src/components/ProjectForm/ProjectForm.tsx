import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useClient, useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientStep } from "./ClientStep";
import { ProjectStep } from "./ProjectStep";
import { EmployersStep } from "./EmployersStep";
import { InvoiceStep } from "./InvoiceStep";
import { ReviewStep } from "./ReviewStep";
import {
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoiceLine,
  useCreateInvoiceLines,
  useInvoices,
} from "@/hooks/useInvoices";
import { XCircle, CheckCircle } from "lucide-react";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project?: any;
}

// Retry function with exponential backoff
const retryWithBackoff = async (
  operation: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 100
) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if it's a database locked error
      const isDatabaseLocked =
        error?.message?.includes("database is locked") ||
        error?.response?.data?.includes("database is locked");

      if (isDatabaseLocked && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(
          `Database locked, retrying in ${delay}ms (attempt ${
            attempt + 1
          }/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
};

// Helper function to remove empty values but keep 0, false, etc.
const removeEmptyValues = (obj: any): any => {
  if (obj === null || obj === undefined || obj === "") {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const cleanedArray = obj
      .map(removeEmptyValues)
      .filter((item) => item !== undefined);
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  }

  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeEmptyValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj; // Keep 0, false, numbers, etc.
};

// Helper function to clean invoice line data - remove empty values but keep 0
const cleanInvoiceLineData = (line: any) => {
  const cleaned: any = {};

  // Only include fields that have values (not empty strings), but keep 0
  if (
    line.product !== undefined &&
    line.product !== null &&
    line.product !== ""
  ) {
    cleaned.product = line.product;
  }
  if (
    line.description !== undefined &&
    line.description !== null &&
    line.description !== ""
  ) {
    cleaned.description = line.description;
  }
  if (line.quantity !== undefined && line.quantity !== null) {
    cleaned.quantity = line.quantity;
  }
  if (line.unit_price !== undefined && line.unit_price !== null) {
    cleaned.unit_price = line.unit_price;
  }
  if (line.discount !== undefined && line.discount !== null) {
    cleaned.discount = line.discount;
  }

  return cleaned;
};

export const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onClose,
  onSuccess,
  project,
}) => {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [selectedEmployers, setSelectedEmployers] = useState<string[]>([]);
  const [projectData, setProjectData] = useState<any>(null);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [clientSearchName, setClientSearchName] = useState<string>("");
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [existingInvoiceId, setExistingInvoiceId] = useState<string | null>(
    null
  );
  const [existingInvoiceLines, setExistingInvoiceLines] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const deleteInvoiceLineMutation = useDeleteInvoiceLine();
  const createInvoiceLinesMutation = useCreateInvoiceLines();

  // Fetch existing invoice if projectId is provided (for editing)
  const { data: existingInvoiceData } = useInvoices(
    {
      project: project?.id,
    },
    {
      enabled: !!project?.id,
    }
  );

  // Fetch client by name when we have a project with a client
  const { data: clientSearchResults, isLoading: isLoadingClient } =
    useClient(clientSearchName);

  // Load all clients for general use
  const { data: allClients } = useClients({ search: "" });

  // Initialize form with project data when in update mode
  useEffect(() => {
    if (open && project && !isInitialized) {
      console.log("Initializing project form with:", project);

      // Extract client name from project.client
      let clientName = "";

      clientName = project.client;

      // Set the client search name to trigger the search
      if (clientName) {
        setClientSearchName(clientName);
      }

      // Set employers - make sure we're using IDs
      const employerIds =
        project?.assigned_employers?.map((emp: any) =>
          typeof emp === "object" ? emp.id : emp
        ) || [];
      setSelectedEmployers(employerIds);

      setProjectData({
        name: project.name,
        start_date: project.start_date,
        end_date: project.end_date || "",
        description: project.description || "",
        warranty_years: project.warranty_years || 0,
        warranty_months: project.warranty_months || 0,
        warranty_days: project.warranty_days || 0,
        duration_maintenance: project.duration_maintenance || null,
        interval_maintenance: project.interval_maintenance || null,
      });

      setCreatedProjectId(project.id);
      setIsInitialized(true);
    } else if (open && !project) {
      // Reset everything for new project
      setStep(1);
      setSelectedClient(null);
      setSelectedEmployers([]);
      setProjectData(null);
      setInvoiceData(null);
      setClientSearchName("");
      setCreatedProjectId(null);
      setExistingInvoiceId(null);
      setExistingInvoiceLines([]);
      setIsInitialized(true);
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [open, project, isInitialized]);

  // Set existing invoice ID and lines when invoice data is loaded
  useEffect(() => {
    if (existingInvoiceData?.results?.[0]) {
      const invoice = existingInvoiceData.results[0];
      console.log("📄 Found existing invoice:", invoice);
      setExistingInvoiceId(invoice.id);

      // Set existing invoice lines directly from the invoice data
      if (invoice.lines && invoice.lines.length > 0) {
        console.log("📥 Setting existing invoice lines:", invoice.lines);
        setExistingInvoiceLines(invoice.lines);
      } else {
        console.log("📭 No lines found in existing invoice");
        setExistingInvoiceLines([]);
      }

      // Initialize invoice data with existing invoice - INCLUDING TVA
      if (!invoiceData && invoice) {
        const initialInvoiceData = {
          invoice: {
            facture: invoice.facture,
            due_date: invoice.due_date,
            deposit_price: invoice.deposit_price,
            tva: invoice.tva || 0,
          },
          lines: invoice.lines || [],
        };
        console.log("💰 Initializing invoice data:", initialInvoiceData);
        setInvoiceData(initialInvoiceData);
      }
    }
  }, [existingInvoiceData, invoiceData]);

  // Handle client search results
  useEffect(() => {
    console.log("the clientis ", clientSearchResults);
    if (clientSearchResults && !selectedClient) {
      // Find the exact matching client by name
      const exactMatch = clientSearchResults;
      if (exactMatch) {
        setSelectedClient(exactMatch);
      } else if (clientSearchResults.results.length === 1) {
        setSelectedClient(clientSearchResults.results[0]);
      } else {
        // Fallback: try to find in allClients
        if (allClients?.results) {
          const fallbackMatch = allClients.results.find((client: any) => {
            if (typeof project?.client === "string") {
              return client.name === project.client;
            } else if (project?.client?.name) {
              return (
                client.name === project.client.name ||
                client.id === project.client.id
              );
            }
            return false;
          });

          if (fallbackMatch) {
            setSelectedClient(fallbackMatch);
          }
        }
      }
    }
  }, [
    clientSearchResults,
    clientSearchName,
    selectedClient,
    allClients,
    project,
  ]);

  // Alternative approach: find client in allClients if search doesn't work
  useEffect(() => {
    if (
      open &&
      project &&
      allClients?.results &&
      !selectedClient &&
      isInitialized
    ) {
      let foundClient = null;

      if (typeof project.client === "string") {
        foundClient = allClients.results.find(
          (client: any) => client.name === project.client
        );
      } else if (project.client?.id) {
        foundClient = allClients.results.find(
          (client: any) => client.id === project.client.id
        );
      } else if (project.client?.name) {
        foundClient = allClients.results.find(
          (client: any) => client.name === project.client.name
        );
      }

      if (foundClient) {
        setSelectedClient(foundClient);
      }
    }
  }, [open, project, allClients, selectedClient, isInitialized]);

  // Reset initialization when dialog closes
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      setClientSearchName("");
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [open]);

  const handleNext = (data?: any) => {
    if (step === 2 && data) {
      setProjectData(data);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // FUNCTION: Delete all existing invoice lines one by one
  const deleteAllExistingLines = async (invoiceId: string) => {
    console.log(
      "🗑️ DELETING ALL existing invoice lines for invoice:",
      invoiceId
    );
    console.log("📋 Lines to delete:", existingInvoiceLines);

    if (existingInvoiceLines.length === 0) {
      console.log("ℹ️ No existing lines to delete");
      return;
    }

    try {
      console.log(
        `🗑️ Starting deletion of ${existingInvoiceLines.length} lines`
      );

      // Delete lines one by one with retry logic
      for (const line of existingInvoiceLines) {
        await retryWithBackoff(() =>
          deleteInvoiceLineMutation.mutateAsync({
            invoiceId,
            lineId: line.id,
          })
        );
        console.log(`✅ Deleted line: ${line.id}`);
      }

      console.log("✅ All existing lines deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting existing lines:", error);
      throw error;
    }
  };

  // FUNCTION: Create all new invoice lines in one batch
  const createAllNewLines = async (invoiceId: string, newLines: any[]) => {
    console.log("➕ CREATING ALL new invoice lines for invoice:", invoiceId);
    console.log("📋 New lines to create:", newLines);

    // Filter out empty lines and clean the data
    const linesToCreate = newLines
      .map((line) => cleanInvoiceLineData(line))
      .filter((line) => Object.keys(line).length > 0);

    if (linesToCreate.length === 0) {
      console.log("ℹ️ No new lines to create");
      return [];
    }

    // Use createInvoiceLinesMutation to create all lines in one API call
    await retryWithBackoff(() =>
      createInvoiceLinesMutation.mutateAsync({
        invoiceId: invoiceId,
        lines: linesToCreate, // rename to "lines"
      })
    );
  };

  // FUNCTION: Handle ALL invoice line operations - ALWAYS delete all then create all new
  const handleInvoiceLineChanges = async (
    invoiceId: string,
    newLines: any[]
  ) => {
    console.log("🔄 STARTING handleInvoiceLineChanges...");
    console.log(
      "📋 Existing invoice lines count:",
      existingInvoiceLines.length
    );
    console.log("🆕 New lines from form count:", newLines.length);
    console.log("🆔 Invoice ID:", invoiceId);

    // ALWAYS Step 1: Delete all existing lines (even if there are no new lines)
    await deleteAllExistingLines(invoiceId);

    // Step 2: Create all new lines in one batch (if there are any)
    if (newLines.length > 0) {
      await createAllNewLines(invoiceId, newLines);
    } else {
      console.log("ℹ️ No new lines to create after deletion");
    }

    console.log("✅ All line operations completed successfully");
  };

  const handleSubmit = async () => {
    if (!selectedClient || !projectData) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Prepare project data for API - remove empty values but keep 0
      const projectApiData = removeEmptyValues({
        name: projectData.name,
        client: selectedClient.id,
        start_date: projectData.start_date,
        end_date: projectData.end_date || "",
        description: projectData.description || "",
        warranty_years: projectData.warranty_years,
        warranty_months: projectData.warranty_months,
        warranty_days: projectData.warranty_days,
        duration_maintenance: projectData.duration_maintenance,
        interval_maintenance: projectData.interval_maintenance,
        assigned_employers:
          selectedEmployers.length > 0 ? selectedEmployers : [],
      });

      let projectId = project?.id;

      // Wrap project operations with retry logic
      if (project) {
        // Update project - remove empty values but keep 0
        const updateData = removeEmptyValues({
          name: projectData.name,
          client: selectedClient.id,
          start_date: projectData.start_date,
          // end_date: projectData.end_date || "",
          description: projectData.description || "",
          warranty_years: projectData.warranty_years,
          warranty_months: projectData.warranty_months,
          warranty_days: projectData.warranty_days,
          duration_maintenance: projectData.duration_maintenance,
          interval_maintenance: projectData.interval_maintenance,
        });

  // Compare employers arrays
        const currentEmployers =
          project.assigned_employers?.map((e: any) =>
            typeof e === "object" ? e.id : e
          ) || [];
        const employersChanged =
          selectedEmployers.length !== currentEmployers.length ||
          !selectedEmployers.every((emp) => currentEmployers.includes(emp));

        if (employersChanged) {
          updateData.assigned_employers = selectedEmployers;
        }

        console.log("🚀 Updating project with data:", updateData);
        await retryWithBackoff(() =>
          updateProjectMutation.mutateAsync({
            id: project.id,
            data: updateData,
          })
        );

        projectId = project.id;
      } else {
        // Create project
        console.log("🚀 Creating project with data:", projectApiData);
        const newProject = await retryWithBackoff(() =>
          createProjectMutation.mutateAsync(projectApiData)
        );
        projectId = newProject.id;
        setCreatedProjectId(newProject.id);
      }

      // Handle invoice creation/update
      if (invoiceData && projectId) {
        try {
          // Clean invoice data - remove empty values but keep 0
          const invoiceApiData = removeEmptyValues({
            project: projectId,
            due_date: invoiceData.invoice.due_date,
            deposit_price: invoiceData.invoice.deposit_price,
            tva: invoiceData.invoice.tva || 0,
          });

          console.log("💰 Processing invoice with data:", invoiceApiData);
          console.log("📦 Lines to process:", invoiceData.lines);

          if (existingInvoiceId) {
            // Update existing invoice - ALWAYS handle line operations
            console.log(
              "📄 Updating existing invoice with ID:",
              existingInvoiceId
            );

            // ALWAYS delete all existing lines and create new ones
            console.log("🔄 Starting line operations...");
            await handleInvoiceLineChanges(
              existingInvoiceId,
              invoiceData.lines
            );

            // Update the main invoice data (without lines)
            console.log("📦 Updating main invoice data...");
            await retryWithBackoff(() =>
              updateInvoiceMutation.mutateAsync({
                id: existingInvoiceId,
                data: invoiceApiData,
              })
            );

            console.log("✅ Invoice update completed");
          } else {
            // Create new invoice with all lines
            console.log("🆕 Creating new invoice for project:", projectId);

            // Clean invoice lines data - remove empty values but keep 0
            const cleanedLines = invoiceData.lines
              .map((line: any) => cleanInvoiceLineData(line))
              .filter((line: any) => Object.keys(line).length > 0);

            const newInvoice = await retryWithBackoff(() =>
              createInvoiceMutation.mutateAsync({
                ...invoiceApiData,
                lines: cleanedLines,
              })
            );
            console.log("✅ New invoice created with lines");
          }

          console.log("🎉 Invoice processed successfully");
          console.log("📊 Summary:");
          console.log("  - Project:", project ? "Updated" : "Created");
          console.log(
            "  - Invoice:",
            existingInvoiceId ? "Updated" : "Created"
          );
          console.log("  - TVA:", invoiceApiData.tva + "%");
          if (existingInvoiceId) {
            console.log(
              "  - Line operations: DELETE ALL existing + CREATE ALL new in one batch"
            );
          } else {
            console.log("  - Line operations: All lines created with invoice");
          }
        } catch (invoiceError) {
          console.error("💥 Error processing invoice:", invoiceError);
          throw invoiceError;
        }
      }

      setSubmitSuccess(
        project ? "Projet modifié avec succès" : "Projet créé avec succès"
      );

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close after a short delay to show the success message
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error saving project:", error);
      setSubmitError(
        error?.message ||
          "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedClient(null);
    setSelectedEmployers([]);
    setProjectData(null);
    setInvoiceData(null);
    setIsInitialized(false);
    setClientSearchName("");
    setCreatedProjectId(null);
    setExistingInvoiceId(null);
    setExistingInvoiceLines([]);
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(false);
    onClose();
  };

  const steps = [
    {
      number: 1,
      title: "Client",
      component: (
        <ClientStep
          onNext={handleNext}
          onClientSelect={setSelectedClient}
          initialClient={selectedClient}
        />
      ),
    },
    {
      number: 2,
      title: "Projet",
      component: (
        <ProjectStep
          onNext={handleNext}
          onBack={handleBack}
          initialData={projectData}
        />
      ),
    },
    {
      number: 3,
      title: "Employés",
      component: (
        <EmployersStep
          onNext={handleNext}
          onBack={handleBack}
          onEmployersSelect={setSelectedEmployers}
          initialEmployers={selectedEmployers}
        />
      ),
    },
    {
      number: 4,
      title: "Facture",
      component: (
        <InvoiceStep
          onNext={handleNext}
          onBack={handleBack}
          onInvoiceData={setInvoiceData}
          projectId={createdProjectId || project?.id}
          client={selectedClient}
          projectData={projectData}
          initialData={invoiceData}
        />
      ),
    },
    {
      number: 5,
      title: "Revue",
      component: (
        <ReviewStep
          onSubmit={handleSubmit}
          onBack={handleBack}
          client={selectedClient}
          projectData={projectData}
          employers={selectedEmployers}
          invoiceData={invoiceData}
          isUpdate={!!project}
          isSubmitting={isSubmitting}
          error={submitError}
        />
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>
            {project
              ? `Modifier le Projet: ${project.name}`
              : "Créer un Nouveau Projet"}
          </DialogTitle>
        </DialogHeader>

        {/* Success Message in Form */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{submitSuccess}</p>
          </div>
        )}

        {/* Loading state for client search */}
        {isLoadingClient && (
          <div className="p-4 text-center text-gray-500">
            Recherche du client...
          </div>
        )}

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
            <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="flex justify-between mb-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepItem.number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepItem.number}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > stepItem.number ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mt-4">
          {steps.find((s) => s.number === step)?.component}
        </div>
      </DialogContent>
    </Dialog>
  );
};
