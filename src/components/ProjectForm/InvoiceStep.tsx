import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import { Plus, Trash2, Search } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useInvoices } from "@/hooks/useInvoices";

const invoiceSchema = yup.object({
  due_date: yup.string().optional(),
  deposit_price: yup.number().min(0).default(0),
  tva: yup.number().min(0).max(100).default(0),
});

type InvoiceFormData = yup.InferType<typeof invoiceSchema>;

interface InvoiceLine {
  id: string;
  product?: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

interface InvoiceStepProps {
  onNext: (data: { invoice: InvoiceFormData; lines: InvoiceLine[] }) => void;
  onBack: () => void;
  onInvoiceData: (data: {
    invoice: InvoiceFormData;
    lines: InvoiceLine[];
  }) => void;
  projectId?: string;
  client?: any;
  projectData?: any;
  initialData?: any;
}

export const InvoiceStep: React.FC<InvoiceStepProps> = ({
  onNext,
  onBack,
  onInvoiceData,
  projectId,
  client,
  projectData,
  initialData,
}) => {
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  const { data: products } = useProducts({
    search: productSearch,
    page_size: 300,
  });

  // Fetch existing invoice if projectId is provided (for editing)
  const { data: existingInvoice } = useInvoices(
    {
      project: projectId,
    },
    {
      enabled: !!projectId && !initialData,
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<InvoiceFormData>({
    resolver: yupResolver(invoiceSchema),
    defaultValues: {
      deposit_price: 0,
      tva: 0,
      due_date: new Date().toISOString().split("T")[0],
    },
  });

  // Watch TVA value for real-time calculations
  const tvaRate = watch("tva") || 0;
  const dueDate = watch("due_date");

  // Load existing invoice data
  useEffect(() => {
    if (existingInvoice?.results?.[0] && !isEditing) {
      const invoice = existingInvoice.results[0];
      console.log("Loading existing invoice:", invoice);

      reset({
        due_date: invoice.due_date || new Date().toISOString().split("T")[0],
        deposit_price: invoice.deposit_price || 0,
        tva: invoice.tva || 0,
      });

      if (invoice.lines && invoice.lines.length > 0) {
        const lines = invoice.lines.map((line: any) => ({
          id: line.id || Date.now().toString(),
          product: line.product?.id || line.product,
          description: line.description || line.product?.name || "",
          quantity: Number(line.quantity) || 1,
          unit_price: Number(line.unit_price) || 0,
          discount: Number(line.discount) || 0,
          line_total: calculateLineTotal(
            Number(line.quantity) || 1,
            Number(line.unit_price) || 0,
            Number(line.discount) || 0
          ),
        }));
        setInvoiceLines(lines);
      }

      setIsEditing(true);
    } else if (initialData) {
      reset({
        ...initialData.invoice,
        due_date:
          initialData.invoice?.due_date ||
          new Date().toISOString().split("T")[0],
      });
      setInvoiceLines(initialData.lines || []);
      setIsEditing(true);
    }
  }, [existingInvoice, initialData, reset, isEditing]);

  const calculateLineTotal = (
    quantity: number,
    unitPrice: number,
    discount: number
  ): number => {
    const subtotal = (quantity || 0) * (unitPrice || 0);
    const discountAmount = (subtotal * (discount || 0)) / 100;
    return Math.max(0, subtotal - discountAmount);
  };

  const addInvoiceLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      discount: 0,
      line_total: 0,
    };
    setInvoiceLines([...invoiceLines, newLine]);
  };

  const removeInvoiceLine = (id: string) => {
    setInvoiceLines(invoiceLines.filter((line) => line.id !== id));
  };

  const updateInvoiceLine = (
    id: string,
    field: keyof InvoiceLine,
    value: any
  ) => {
    setInvoiceLines((lines) =>
      lines.map((line) => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value };

          // Recalculate line total when relevant fields change
          if (
            field === "quantity" ||
            field === "unit_price" ||
            field === "discount"
          ) {
            const quantity =
              field === "quantity"
                ? Number(value) || 0
                : Number(line.quantity) || 0;
            const unitPrice =
              field === "unit_price"
                ? Number(value) || 0
                : Number(line.unit_price) || 0;
            const discount =
              field === "discount"
                ? Number(value) || 0
                : Number(line.discount) || 0;

            updatedLine.line_total = calculateLineTotal(
              quantity,
              unitPrice,
              discount
            );
          }

          return updatedLine;
        }
        return line;
      })
    );
  };

  const handleProductSelect = (lineId: string, productId: string) => {
    const product = products?.results?.find((p: any) => p.id == productId);
    if (product && productId !== "none") {
      const sellingPrice = Number(product.selling_price) || 0;

      setInvoiceLines((lines) =>
        lines.map((line) => {
          if (line.id === lineId) {
            const quantity = Number(line.quantity) || 1;
            const discount = Number(line.discount) || 0;

            return {
              ...line,
              product: productId,
              description: product.name || "",
              unit_price: sellingPrice,
              line_total: calculateLineTotal(quantity, sellingPrice, discount),
            };
          }
          return line;
        })
      );
    } else {
      // Clear product selection but keep manual entries
      setInvoiceLines((lines) =>
        lines.map((line) => {
          if (line.id === lineId) {
            const quantity = Number(line.quantity) || 1;
            const unitPrice = Number(line.unit_price) || 0;
            const discount = Number(line.discount) || 0;

            return {
              ...line,
              product: "",
              line_total: calculateLineTotal(quantity, unitPrice, discount),
            };
          }
          return line;
        })
      );
    }
    setOpenSelectId(null);
  };

  const onSubmit = (data: InvoiceFormData) => {
    const invoiceData = {
      invoice: {
        ...data,
        due_date: data.due_date || new Date().toISOString().split("T")[0],
      },
      lines: invoiceLines,
    };

    onInvoiceData(invoiceData);
    onNext(invoiceData);
  };

  // Calculate totals with proper number conversion and fallbacks
  const totalAmount = invoiceLines.reduce(
    (sum, line) => sum + (Number(line.line_total) || 0),
    0
  );
  const tvaAmount = (totalAmount * (Number(tvaRate) || 0)) / 100;
  const grandTotal = totalAmount + tvaAmount;

  // Filter products based on search
  const filteredProducts = products?.results?.filter((product: any) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Informations de Facturation</h3>
        <p className="text-sm text-gray-600">
          Renseignez les détails de la facture et les lignes de produits
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="due_date">Date d'échéance</Label>
            <Input
              id="due_date"
              type="date"
              {...register("due_date")}
              value={dueDate || new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <Label htmlFor="deposit_price">Acompte (DA)</Label>
            <Input
              id="deposit_price"
              type="number"
              step="0.01"
              min="0"
              {...register("deposit_price", { valueAsNumber: true })}
              placeholder="0.00"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div>
            <Label htmlFor="tva">TVA (%)</Label>
            <Input
              id="tva"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("tva", { valueAsNumber: true })}
              placeholder="0"
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Lignes de Produits/Services</h4>
            <Button type="button" variant="outline" onClick={addInvoiceLine}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ligne
            </Button>
          </div>

          {invoiceLines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              Aucune ligne de produit/service ajoutée
            </div>
          ) : (
            <div className="space-y-4">
              {invoiceLines.map((line) => (
                <div key={line.id} className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>
                        Produit{" "}
                        <span className="text-gray-500">(Optionnel)</span>
                      </Label>
                      <div className="space-y-2">
                        <Select
                          value={line.product || "none"}
                          onValueChange={(value) => {
                            handleProductSelect(line.id, value);
                          }}
                          open={openSelectId === line.id}
                          onOpenChange={(open) => {
                            setOpenSelectId(open ? line.id : null);
                            if (open) {
                              setProductSearch("");
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                          <SelectContent className="p-0">
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                  placeholder="Rechercher un produit..."
                                  value={productSearch}
                                  onChange={(e) =>
                                    setProductSearch(e.target.value)
                                  }
                                  className="pl-10"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>

                            <div className="max-h-60 overflow-auto">
                              <SelectItem value="none">
                                Sélectionner un produit
                              </SelectItem>
                              {filteredProducts?.map((product: any) => (
                                <SelectItem
                                  key={product.id}
                                  value={product.id}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {Number(
                                        product.selling_price || 0
                                      ).toFixed(2)}{" "}
                                      DA
                                      {product.description &&
                                        ` - ${product.description}`}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                              {filteredProducts?.length === 0 &&
                                productSearch && (
                                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    Aucun produit trouvé
                                  </div>
                                )}
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Input
                        value={line.description}
                        onChange={(e) =>
                          updateInvoiceLine(
                            line.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description du produit/service"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={line.quantity}
                        onChange={(e) =>
                          updateInvoiceLine(
                            line.id,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <Label>Prix Unitaire (DA)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.unit_price}
                        onChange={(e) =>
                          updateInvoiceLine(
                            line.id,
                            "unit_price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div>
                      <Label>Remise (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={line.discount}
                        onChange={(e) =>
                          updateInvoiceLine(
                            line.id,
                            "discount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <Label>Total Ligne (DA)</Label>
                        <div className="font-medium text-lg">
                          {Number(line.line_total || 0).toFixed(2)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInvoiceLine(line.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {invoiceLines.length > 0 && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="md:col-span-3 text-right">
                  <strong>Montant HT:</strong>
                </div>
                <div className="text-right font-medium">
                  {Number(totalAmount || 0).toFixed(2)} DA
                </div>

                {tvaRate > 0 && (
                  <>
                    <div className="md:col-span-3 text-right">
                      <strong>TVA ({tvaRate}%):</strong>
                    </div>
                    <div className="text-right font-medium">
                      {Number(tvaAmount || 0).toFixed(2)} DA
                    </div>
                  </>
                )}

                <div className="md:col-span-3 text-right">
                  <strong className="text-lg">
                    {tvaRate > 0 ? "Total TTC:" : "Total:"}
                  </strong>
                </div>
                <div className="text-right font-bold text-lg">
                  {Number(grandTotal || 0).toFixed(2)} DA
                </div>
              </div>
            </div>
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
