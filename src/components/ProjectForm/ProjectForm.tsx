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
  useUpdateInvoiceLine,
  useDeleteInvoiceLine,
  useCreateInvoiceLine,
  useInvoices,
} from "@/hooks/useInvoices";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
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

// Batch operations to reduce concurrent database access
const batchOperations = async (
  operations: (() => Promise<any>)[],
  batchSize = 3,
  delayBetweenBatches = 100
) => {
  const results = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(
        operations.length / batchSize
      )}`
    );

    const batchResults = await Promise.allSettled(
      batch.map((op) => retryWithBackoff(op))
    );

    results.push(...batchResults);

    // Add delay between batches if not the last batch
    if (i + batchSize < operations.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
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

  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const updateInvoiceLineMutation = useUpdateInvoiceLine();
  const deleteInvoiceLineMutation = useDeleteInvoiceLine();
  const createInvoiceLineMutation = useCreateInvoiceLine();

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

  // Function to handle ALL invoice line operations (create, update, delete)
  const handleInvoiceLineChanges = async (
    invoiceId: string,
    newLines: any[]
  ) => {
    console.log("🔄 STARTING handleInvoiceLineChanges...");
    console.log("📋 Existing invoice lines:", existingInvoiceLines);
    console.log("🆕 New lines from form:", newLines);
    console.log("🆔 Invoice ID:", invoiceId);

    const operations: (() => Promise<any>)[] = [];
    let createCount = 0;
    let updateCount = 0;
    let deleteCount = 0;

    // Find lines to CREATE (lines without IDs)
    for (const newLine of newLines) {
      if (!newLine.id) {
        const cleanedLineData = cleanInvoiceLineData(newLine);
        // Only create if there's actual data
        if (Object.keys(cleanedLineData).length > 0) {
          console.log("➕ CREATE NEEDED for new line:", cleanedLineData);
          operations.push(() =>
            createInvoiceLineMutation.mutateAsync({
              invoiceId,
              data: cleanedLineData,
            })
          );
          createCount++;
        }
      }
    }

    // Find lines to UPDATE (lines that exist in both arrays but have changed)
    for (const newLine of newLines) {
      // Only check lines that have an ID (existing lines)
      if (newLine.id) {
        const existingLine = existingInvoiceLines.find(
          (line) => line.id === newLine.id
        );

        if (existingLine) {
          // Check if line has changed
          const hasChanged =
            existingLine.product !== newLine.product ||
            existingLine.description !== newLine.description ||
            existingLine.quantity !== newLine.quantity ||
            existingLine.unit_price !== newLine.unit_price ||
            existingLine.discount !== newLine.discount;

          if (hasChanged) {
            const cleanedLineData = cleanInvoiceLineData(newLine);
            console.log(`📝 UPDATE NEEDED for line ${existingLine.id}`, {
              from: {
                product: existingLine.product,
                description: existingLine.description,
                quantity: existingLine.quantity,
                unit_price: existingLine.unit_price,
                discount: existingLine.discount,
              },
              to: cleanedLineData,
            });

            operations.push(() =>
              updateInvoiceLineMutation.mutateAsync({
                invoiceId,
                lineId: existingLine.id,
                data: cleanedLineData,
              })
            );
            updateCount++;
          } else {
            console.log(`✅ Line ${existingLine.id} unchanged`);
          }
        } else {
          console.log(
            `❓ Line with ID ${newLine.id} not found in existing lines - treating as new line`
          );
          // This shouldn't normally happen, but if it does, create it
          const cleanedLineData = cleanInvoiceLineData(newLine);
          if (Object.keys(cleanedLineData).length > 0) {
            operations.push(() =>
              createInvoiceLineMutation.mutateAsync({
                invoiceId,
                data: cleanedLineData,
              })
            );
            createCount++;
          }
        }
      }
    }

    // Find lines to DELETE (lines that exist in existingInvoiceLines but not in newLines)
    for (const existingLine of existingInvoiceLines) {
      const lineStillExists = newLines.some(
        (newLine) => newLine.id === existingLine.id
      );

      if (!lineStillExists) {
        console.log(`🗑️ DELETE NEEDED for line ${existingLine.id}`);
        operations.push(() =>
          deleteInvoiceLineMutation.mutateAsync({
            invoiceId,
            lineId: existingLine.id,
          })
        );
        deleteCount++;
      }
    }

    console.log(
      `🔄 Found ${operations.length} line operations to perform (${createCount} creates, ${updateCount} updates, ${deleteCount} deletes)`
    );

    // Execute all operations with batching and retry logic
    if (operations.length > 0) {
      try {
        console.log("🚀 Executing line operations with batching...");
        const results = await batchOperations(operations, 2, 200); // Batch size 2, 200ms delay
        console.log("✅ All line operations completed successfully");

        // Check for any failed operations
        const failedOperations = results.filter(
          (result) => result.status === "rejected"
        );
        if (failedOperations.length > 0) {
          console.error("❌ Some operations failed:", failedOperations);
          throw new Error(`${failedOperations.length} operations failed`);
        }

        return results;
      } catch (error) {
        console.error("❌ Error executing line operations:", error);
        throw error;
      }
    } else {
      console.log("ℹ️ No line operations needed");
      return [];
    }
  };

  const handleSubmit = async () => {
    if (!selectedClient || !projectData) return;

    setIsSubmitting(true);
    setSubmitError(null);

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
          end_date: projectData.end_date || "",
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
            // Update existing invoice and handle ALL line operations
            console.log(
              "📄 Updating existing invoice with ID:",
              existingInvoiceId
            );
            console.log(
              "📊 Existing lines count:",
              existingInvoiceLines.length
            );

            // Handle ALL line operations (create, update, delete)
            if (
              invoiceData.lines.length > 0 ||
              existingInvoiceLines.length > 0
            ) {
              console.log("🔄 Starting ALL line operations...");
              await handleInvoiceLineChanges(
                existingInvoiceId,
                invoiceData.lines
              );
            } else {
              console.log("⚠️ No lines to process");
            }

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
              "  - Line operations: Individual CREATE/UPDATE/DELETE operations"
            );
          } else {
            console.log("  - Line operations: All lines created with invoice");
          }
        } catch (invoiceError) {
          console.error("💥 Error processing invoice:", invoiceError);
          throw invoiceError;
        }
      }

      handleClose();
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

        {/* Loading state for client search */}
        {isLoadingClient && (
          <div className="p-4 text-center text-gray-500">
            Recherche du client...
          </div>
        )}

        {/* Error Display */}
        {submitError && (
          <div className="p-4 mt-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="font-bold">Erreur:</h3>
            <p>{submitError}</p>
            <p className="text-sm mt-2">
              Si le problème persiste, veuillez réessayer dans quelques
              instants.
            </p>
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
