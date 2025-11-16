// invoicePDFGenerator.ts
import jsPDF from "jspdf";

interface InvoiceData {
  invoice: {
    bon_de_commande?: string;
    facture?: string;
    facture_proforma?: string;
    bon_de_versement?: string;
    bon_de_livraison?: string;
    due_date?: string;
    deposit_price?: number;
    tva?: number;
    status?: string;
    [key: string]: any;
  };
  lines: any[];
}

interface Client {
  id?: number;
  name: string;
  email?: string;
  phone_number?: string;
  address?: any;
  is_corporate?: boolean;
  rc?: string;
  nif?: string;
  nis?: string;
  ai?: string;
  art?: string;
  account_number?: string;
  fax?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProjectData {
  name: string;
  start_date: string;
  end_date?: string;
  description?: string;
  warranty_years?: number;
  warranty_months?: number;
  warranty_days?: number;
}

// KR7 FIBRE Company Information
const COMPANY_INFO = {
  name: "EURL KR7 FIBRE",
  address: "ALI MENDJLI 4Chemin Bt B LOC AL BG2 EL KHROUB",
  city: "Constantine, Alger",
  phone: "0770819063",
  email: "commercial@kr7fibre.com",
  rc: "25/00 - 0073489 B22",
  nif: "002225007348990",
  nis: "002225060005269",
  ai: "25068222182",
  activity: "Installation Fibre Optique et Réseaux",
};

// Number to French words converter
const numberToFrenchWords = (num: number): string => {
  if (num === 0) return "zéro";

  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
  ];
  const teens = [
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ];

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];

    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;

      if (ten === 7) {
        return unit === 0
          ? "soixante-dix"
          : `soixante-${teens[unit] || units[unit]}`;
      }
      if (ten === 9) {
        return unit === 0
          ? "quatre-vingt-dix"
          : `quatre-vingt-${teens[unit] || units[unit]}`;
      }

      let result = tens[ten];
      if (unit === 1 && ten !== 8) {
        result += " et un";
      } else if (unit > 0) {
        result += `-${units[unit]}`;
      } else if (ten === 8) {
        result += "s";
      }
      return result;
    }

    const hundred = Math.floor(n / 100);
    const rest = n % 100;

    let result = "";
    if (hundred === 1) {
      result = "cent";
    } else {
      result = `${units[hundred]} cent`;
    }

    if (rest === 0 && hundred > 1) {
      result += "s";
    } else if (rest > 0) {
      result += ` ${convertLessThanThousand(rest)}`;
    }

    return result;
  };

  const convertInternal = (n: number): string => {
    if (n === 0) return "";

    if (n < 1000) return convertLessThanThousand(n);

    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;

      let result = "";
      if (thousands === 1) {
        result = "mille";
      } else {
        result = `${convertLessThanThousand(thousands)} mille`;
      }

      if (rest > 0) {
        result += ` ${convertLessThanThousand(rest)}`;
      }
      return result;
    }

    if (n < 1000000000) {
      const millions = Math.floor(n / 1000000);
      const rest = n % 1000000;

      let result = "";
      if (millions === 1) {
        result = "un million";
      } else {
        result = `${convertLessThanThousand(millions)} millions`;
      }

      if (rest > 0) {
        result += ` ${convertInternal(rest)}`;
      }
      return result;
    }

    const billions = Math.floor(n / 1000000000);
    const rest = n % 1000000000;

    let result = "";
    if (billions === 1) {
      result = "un milliard";
    } else {
      result = `${convertLessThanThousand(billions)} milliards`;
    }

    if (rest > 0) {
      result += ` ${convertInternal(rest)}`;
    }
    return result;
  };

  // Handle decimal numbers
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = convertInternal(integerPart);

  if (decimalPart > 0) {
    result += ` dinars et ${convertInternal(decimalPart)} centimes`;
  } else {
    result += " dinars";
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
};

// Helper function to format client address
const formatClientAddress = (address: any): string => {
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

export const generateInvoicePDF = (
  type: string,
  invoiceData: InvoiceData,
  client: Client,
  projectData: ProjectData,
  projectId?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = 20;

  // Set document properties based on type
  let title = "";
  let documentNumber = "";

  switch (type) {
    case "bon_de_commande":
      title = "BON DE COMMANDE";
      documentNumber =
        invoiceData.invoice.facture ||
        `BC-${projectId || "TEMP"}-${Date.now().toString().slice(-6)}`;
      break;
    case "facture":
      title = "FACTURE";
      documentNumber =
        invoiceData.invoice.facture ||
        `FAC-${projectId || "TEMP"}-${Date.now().toString().slice(-6)}`;
      break;
    case "facture_proforma":
      title = "FACTURE PROFORMA";
      documentNumber =
        invoiceData.invoice.facture ||
        `FP-${projectId || "TEMP"}-${Date.now().toString().slice(-6)}`;
      break;
    case "bon_de_versement":
      title = "BON DE VERSEMENT";
      documentNumber =
        invoiceData.invoice.facture ||
        `BV-${projectId || "TEMP"}-${Date.now().toString().slice(-6)}`;
      break;
    case "bon_de_livraison":
      title = "BON DE LIVRAISON";
      documentNumber =
        invoiceData.invoice.facture ||
        `BL-${projectId || "TEMP"}-${Date.now().toString().slice(-6)}`;
      break;
    default:
      title = "DOCUMENT";
      documentNumber = `DOC-${projectId || "TEMP"}-${Date.now()
        .toString()
        .slice(-6)}`;
  }

  // For bon_de_commande, show client header instead of company header
  if (type === "bon_de_commande") {
    // Client header for bon de commande
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(client.name, margin, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Client header information - only add non-empty lines
    const clientHeaderLines: string[] = [];

    const formattedAddress = formatClientAddress(client.address);
    if (formattedAddress) clientHeaderLines.push(formattedAddress);
    if (client.rc) clientHeaderLines.push(`RC: ${client.rc}`);
    if (client.nif) clientHeaderLines.push(`NIF: ${client.nif}`);
    if (client.ai) clientHeaderLines.push(`AI: ${client.ai}`);
    if (client.nis) clientHeaderLines.push(`NIS: ${client.nis}`);
    if (client.phone_number)
      clientHeaderLines.push(`Tél: ${client.phone_number}`);
    if (client.email) clientHeaderLines.push(`Email: ${client.email}`);

    clientHeaderLines.forEach((line) => {
      if (line && line.trim()) {
        doc.text(line, margin, currentY);
        currentY += 3.5;
      }
    });
  } else {
    // Company header for other document types
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_INFO.name, margin, currentY);
    currentY += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    // Company address and info
    const companyLines = [
      COMPANY_INFO.address + ", " + COMPANY_INFO.city,
      `RC: ${COMPANY_INFO.rc}`,
      `NIF: ${COMPANY_INFO.nif}`,
      `AI: ${COMPANY_INFO.ai}`,
      `NIS: ${COMPANY_INFO.nis}`,
      `Activité principale: ${COMPANY_INFO.activity}`,
    ];

    companyLines.forEach((line) => {
      doc.text(line, margin, currentY);
      currentY += 3.5;
    });
  }

  // Separator line
  currentY += 6;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  // Document title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;

  // For Facture Proforma, add special notice
  // if (type === "facture_proforma") {
  //   doc.setFontSize(8);
  //   doc.setFont("helvetica", "italic");
  //   doc.setTextColor(100, 100, 100);
  //   doc.text(
  //     "Document préliminaire - Sans valeur comptable",
  //     pageWidth / 2,
  //     currentY,
  //     { align: "center" }
  //   );
  //   doc.setTextColor(0, 0, 0);
  //   currentY += 8;
  // }

  // Two-column layout for recipient and document info
  const leftColumn = margin;
  const rightColumn = pageWidth - 60;

  // Only show "Destinataire" title for non-bon_de_commande documents
  if (type !== "bon_de_commande") {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Destinataire", leftColumn, currentY);
    currentY += 5;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  let recipientLines: string[] = [];

  if (type === "bon_de_commande") {
    // Show company as recipient for bon de commande
    recipientLines = [
      COMPANY_INFO.name,
      COMPANY_INFO.address + ", " + COMPANY_INFO.city,
      `Tél: ${COMPANY_INFO.phone}`,
      `Email: ${COMPANY_INFO.email}`,
      `RC: ${COMPANY_INFO.rc}`,
      `NIF: ${COMPANY_INFO.nif}`,
      `AI: ${COMPANY_INFO.ai}`,
      `NIS: ${COMPANY_INFO.nis}`,
    ];
  } else {
    // Show client as recipient for other documents
    recipientLines = [client.name];

    if (client.email) recipientLines.push(`Email: ${client.email}`);
    if (client.phone_number) recipientLines.push(`Tél: ${client.phone_number}`);

    const formattedAddress = formatClientAddress(client.address);
    if (formattedAddress) recipientLines.push(`Adresse: ${formattedAddress}`);

    // Corporate information
    if (client.rc) recipientLines.push(`RC: ${client.rc}`);
    if (client.nif) recipientLines.push(`NIF: ${client.nif}`);
    if (client.nis) recipientLines.push(`NIS: ${client.nis}`);
    if (client.ai) recipientLines.push(`AI: ${client.ai}`);
    if (client.art) recipientLines.push(`ART: ${client.art}`);
    if (client.account_number)
      recipientLines.push(`Compte: ${client.account_number}`);
    if (client.fax) recipientLines.push(`Fax: ${client.fax}`);
    // if (client.is_corporate !== undefined) {
    //   recipientLines.push(
    //     `Type: ${client.is_corporate ? "Entreprise" : "Particulier"}`
    //   );
    // }
  }

  let recipientInfoY = currentY;
  recipientLines.forEach((line) => {
    if (line && line.trim()) {
      doc.text(line, leftColumn, recipientInfoY);
      recipientInfoY += 3.5;
    }
  });

  // Document information - Right column
  let docInfoY = currentY;

  // Date label and value
  doc.setFont("helvetica", "bold");
  const dateLabel = "Date:";
  const dateLabelWidth = doc.getTextWidth(dateLabel);
  doc.text(dateLabel, rightColumn - dateLabelWidth - 2, docInfoY);

  doc.setFont("helvetica", "normal");
  const dueDate =
    type === "facture" && invoiceData.invoice.due_date
      ? new Date(invoiceData.invoice.due_date).toLocaleDateString("fr-FR")
      : new Date().toLocaleDateString("fr-FR");

  doc.text(dueDate, rightColumn, docInfoY);
  docInfoY += 5;

  // Number label and value
  doc.setFont("helvetica", "bold");
  const numLabel = "Numéro:";
  const numLabelWidth = doc.getTextWidth(numLabel);
  doc.text(numLabel, rightColumn - numLabelWidth - 2, docInfoY);

  doc.setFont("helvetica", "normal");
  doc.text(documentNumber, rightColumn, docInfoY);

  // For proforma, add validity period
  // if (type === "facture_proforma") {
  //   docInfoY += 5;
  //   doc.setFont("helvetica", "bold");
  //   const validLabel = "Validité:";
  //   const validLabelWidth = doc.getTextWidth(validLabel);
  //   doc.text(validLabel, rightColumn - validLabelWidth - 2, docInfoY);
  //   doc.setFont("helvetica", "normal");
  //   doc.text("30 jours", rightColumn, docInfoY);
  // }

  currentY = Math.max(recipientInfoY, docInfoY) + 8;

  // Separator line before table
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 6;

  // Check if we need to show discount column
  const hasDiscount = invoiceData.lines.some((line) => line.discount > 0);

  // Define column positions
  const getColumnPositions = () => {
    const tableWidth = pageWidth - 2 * margin;

    if (type === "bon_de_commande") {
      return {
        ord: margin,
        description: margin + 15,
        quantity: margin + tableWidth * 0.55,
        unitPrice: margin + tableWidth * 0.7,
        amount: pageWidth - margin,
        descriptionWidth: 75,
        numberWidth: 20,
      };
    } else if (type === "bon_de_livraison") {
      return {
        ord: margin,
        description: margin + 15,
        quantity: pageWidth - margin - 25,
        descriptionWidth: 120,
        numberWidth: 20,
      };
    } else {
      return {
        description: margin,
        quantity: margin + tableWidth * 0.5,
        unitPrice: margin + tableWidth * 0.65,
        discount: hasDiscount ? margin + tableWidth * 0.8 : 0,
        amount: pageWidth - margin,
        descriptionWidth: 70,
        numberWidth: 20,
      };
    }
  };

  const columns = getColumnPositions();

  // Table for invoice lines
  if (invoiceData.lines.length > 0 && type !== "bon_de_versement") {
    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    if (type === "bon_de_commande") {
      doc.text("Ord", columns.ord, currentY);
      doc.text("Désignation", columns.description, currentY);
      doc.text("Qté", columns.quantity, currentY, { align: "right" });
      doc.text("P. Unit", columns.unitPrice, currentY, { align: "right" });
      doc.text("Montant", columns.amount, currentY, { align: "right" });
    } else if (type === "bon_de_livraison") {
      doc.text("Ord", columns.ord, currentY);
      doc.text("Désignation", columns.description, currentY);
      doc.text("Qté Livrée", columns.quantity, currentY, { align: "right" });
    } else {
      doc.text("Description", columns.description, currentY);
      doc.text("Qté", columns.quantity, currentY, { align: "right" });
      doc.text("Prix", columns.unitPrice, currentY, { align: "right" });
      if (hasDiscount) {
        doc.text("Remise", columns.discount, currentY, { align: "right" });
      }
      doc.text("Montant", columns.amount, currentY, { align: "right" });
    }

    currentY += 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    let subtotal = 0;

    for (let index = 0; index < invoiceData.lines.length; index++) {
      const line = invoiceData.lines[index];

      // Check if we need a new page
      if (currentY > pageHeight - 80) {
        doc.addPage();
        currentY = 20;

        // Redraw header on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        if (type === "bon_de_commande") {
          doc.text("Ord", columns.ord, currentY);
          doc.text("Désignation", columns.description, currentY);
          doc.text("Qté", columns.quantity, currentY, { align: "right" });
          doc.text("P. Unit", columns.unitPrice, currentY, { align: "right" });
          doc.text("Montant", columns.amount, currentY, { align: "right" });
        } else if (type === "bon_de_livraison") {
          doc.text("Ord", columns.ord, currentY);
          doc.text("Désignation", columns.description, currentY);
          doc.text("Qté Livrée", columns.quantity, currentY, {
            align: "right",
          });
        } else {
          doc.text("Description", columns.description, currentY);
          doc.text("Qté", columns.quantity, currentY, { align: "right" });
          doc.text("Prix", columns.unitPrice, currentY, { align: "right" });
          if (hasDiscount) {
            doc.text("Remise", columns.discount, currentY, { align: "right" });
          }
          doc.text("Montant", columns.amount, currentY, { align: "right" });
        }
        currentY += 5;
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
      }

      const description = line.description || line.product || "Produit/Service";
      const quantity = line.quantity ? line.quantity.toString() : "0";

      const unitPrice = `${formatNumber(parseFloat(line.unit_price || 0))} DA`;
      const discount =
        line.discount > 0 ? `${formatNumber(line.discount)} DA` : "—";
      const total = `${formatNumber(parseFloat(line.line_total || 0))} DA`;

      subtotal += parseFloat(line.line_total || 0);

      const rowStartY = currentY;
      const fixedRowHeight = 8;
      const verticalCenter = rowStartY + fixedRowHeight / 2;

      let descriptionLines: string[];
      try {
        descriptionLines = doc.splitTextToSize(
          description,
          columns.descriptionWidth
        );
        if (!Array.isArray(descriptionLines)) {
          descriptionLines = [description];
        }
      } catch (error) {
        console.error("Error splitting text:", error);
        descriptionLines = [description];
      }

      if (type === "bon_de_commande" || type === "bon_de_livraison") {
        doc.text((index + 1).toString(), columns.ord, verticalCenter);
      }

      if (descriptionLines.length === 1) {
        doc.text(
          descriptionLines[0].trim(),
          columns.description,
          verticalCenter
        );
      } else {
        const descStartY = verticalCenter - (descriptionLines.length - 1) * 2;
        descriptionLines.forEach((descLine: string, lineIndex: number) => {
          if (descLine && typeof descLine === "string") {
            doc.text(
              descLine.trim(),
              columns.description,
              descStartY + lineIndex * 4
            );
          }
        });
      }

      doc.text(quantity, columns.quantity, verticalCenter, { align: "right" });

      if (type !== "bon_de_livraison") {
        doc.text(unitPrice, columns.unitPrice, verticalCenter, {
          align: "right",
        });

        if (hasDiscount && columns.discount && columns.discount > 0) {
          doc.text(discount, columns.discount, verticalCenter, {
            align: "right",
          });
        }

        doc.text(total, columns.amount, verticalCenter, { align: "right" });
      }

      currentY = rowStartY + fixedRowHeight + 2;

      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.line(margin, currentY, pageWidth - margin, currentY);

      currentY += 2;
    }

    // Totals section
    if (type !== "bon_de_livraison") {
      currentY += 10;

      const tvaRate = invoiceData.invoice.tva || 0;
      const tva = subtotal * (tvaRate / 100);
      const grandTotal = subtotal + tva;

      const subtotalFormatted = formatNumber(subtotal);
      const tvaFormatted = formatNumber(tva);
      const grandTotalFormatted = formatNumber(grandTotal);

      const totalsRight = pageWidth - margin;

      if (tvaRate === 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Montant HT", totalsRight - 60, currentY, { align: "right" });
        doc.text(`${subtotalFormatted} DA`, totalsRight, currentY, {
          align: "right",
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Montant HT", totalsRight - 60, currentY, { align: "right" });
        doc.text(`${subtotalFormatted} DA`, totalsRight, currentY, {
          align: "right",
        });
        currentY += 6;

        doc.text(`TVA (${tvaRate}%)`, totalsRight - 60, currentY, {
          align: "right",
        });
        doc.text(`${tvaFormatted} DA`, totalsRight, currentY, {
          align: "right",
        });
        currentY += 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("TOTAL TTC", totalsRight - 60, currentY, { align: "right" });
        doc.text(`${grandTotalFormatted} DA`, totalsRight, currentY, {
          align: "right",
        });
      }

      currentY += 8;

      // Amount in words - for facture and facture_proforma
      if (type === "facture" || type === "facture_proforma") {
        const amountInWords = numberToFrenchWords(grandTotal);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("Arrêté la présente facture à la somme de:", margin, currentY);
        currentY += 5;

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        const maxWidth = pageWidth - 2 * margin;
        const wordLines = doc.splitTextToSize(amountInWords, maxWidth);

        wordLines.forEach((line: string) => {
          doc.text(line, margin, currentY);
          currentY += 4;
        });
      }

      currentY += 12;
    } else {
      currentY += 15;
    }
  } else if (
    type === "bon_de_versement" &&
    invoiceData.invoice.deposit_price > 0
  ) {
    currentY += 15;

    const boxY = currentY;
    const boxHeight = 45;
    const boxWidth = pageWidth - 2 * margin;

    doc.setFillColor(245, 245, 245);
    doc.rect(margin, boxY, boxWidth, boxHeight, "F");

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.rect(margin, boxY, boxWidth, boxHeight);

    currentY = boxY + 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("MONTANT DE L'ACOMPTE VERSÉ", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 10;

    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text(
      `${formatNumber(invoiceData.invoice.deposit_price)} DA`,
      pageWidth / 2,
      currentY,
      { align: "center" }
    );
    doc.setTextColor(0, 0, 0);

    currentY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const paymentDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.text(`Date de versement: ${paymentDate}`, pageWidth / 2, currentY, {
      align: "center",
    });

    currentY = boxY + boxHeight + 20;

    if (invoiceData.invoice.facture) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("RÉFÉRENCE:", margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Facture N° ${invoiceData.invoice.facture}`,
        margin + 30,
        currentY
      );
      currentY += 8;
    }

    if (invoiceData.lines && invoiceData.lines.length > 0) {
      const totalAmount = invoiceData.lines.reduce(
        (sum: number, line: any) => sum + Number(line.line_total || 0),
        0
      );
      const remainingAmount = totalAmount - invoiceData.invoice.deposit_price;

      if (remainingAmount > 0) {
        currentY += 5;
        doc.setFont("helvetica", "bold");
        doc.text("Montant total:", margin, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${formatNumber(totalAmount)} DA`, margin + 35, currentY);
        currentY += 5;

        doc.setFont("helvetica", "bold");
        doc.text("Montant versé:", margin, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(
          `${formatNumber(invoiceData.invoice.deposit_price)} DA`,
          margin + 35,
          currentY
        );
        currentY += 5;

        doc.setFont("helvetica", "bold");
        doc.text("Reste à payer:", margin, currentY);
        doc.setTextColor(200, 0, 0);
        doc.text(`${formatNumber(remainingAmount)} DA`, margin + 35, currentY);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
      }
    }

    currentY += 10;
  }

  // Mode de paiement
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Mode de paiement: espece", margin, currentY);
  currentY += 8;

  // Conditions de paiement for proforma
  // if (type === "facture_proforma") {
  //   doc.setFont("helvetica", "bold");
  //   doc.setFontSize(9);
  //   doc.text("CONDITIONS DE PAIEMENT:", margin, currentY);
  //   currentY += 5;

  //   doc.setFont("helvetica", "normal");
  //   doc.setFontSize(8);
  //   const conditions = [
  //     "• Cette facture proforma est valable pour une durée de 30 jours",
  //     "• Un acompte de 50% sera exigé avant le début des travaux",
  //     "• Le solde sera payable à la livraison des travaux",
  //     "• Cette facture n'a aucune valeur comptable ou fiscale",
  //   ];

  //   conditions.forEach((condition) => {
  //     doc.text(condition, margin + 2, currentY);
  //     currentY += 4;
  //   });

  //   currentY += 8;
  // }

  // Signature area
  const signatureY = Math.max(currentY + 15, pageHeight - 40);

  if (type === "bon_de_commande") {
    doc.setFontSize(9);
    doc.text("Visa et cachet du fournisseur", margin, signatureY);
    doc.text("Reçu le……………..", margin, signatureY + 8);
    doc.text("Cachet et Signature", pageWidth - 70, signatureY);
  } else if (type === "bon_de_livraison") {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("LE LIVREUR", margin + 10, signatureY);
    doc.text("LE CLIENT", pageWidth - margin - 50, signatureY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Nom et Signature", margin + 10, signatureY + 6);
    doc.text("Nom et Signature", pageWidth - margin - 50, signatureY + 6);

    doc.text("Date: _______________", margin + 5, signatureY + 15);
    doc.text("Date: _______________", pageWidth - margin - 60, signatureY + 15);
  } else if (type === "bon_de_versement") {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Reçu par:", margin, signatureY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Nom: _____________________________", margin, signatureY + 8);
    doc.text(
      "Signature: _____________________________",
      margin,
      signatureY + 15
    );
    doc.text("Cachet de l'entreprise", pageWidth - margin - 45, signatureY + 8);
  } else if (type === "facture_proforma") {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.setFont("helvetica", "bold");
    doc.text("Cachet et Signature", pageWidth - margin - 45, signatureY);
    doc.setFont("helvetica", "normal");
  } else {
    doc.setFontSize(9);
    doc.text("Signature et Cachet", pageWidth / 2, signatureY, {
      align: "center",
    });
  }

  // Footer
  doc.setFontSize(7);

  // Save the PDF
  doc.save(`${type}_${documentNumber}.pdf`);
};

// Helper function to format numbers with Algerian formatting
const formatNumber = (num: number): string => {
  if (isNaN(num) || !isFinite(num)) {
    return "0,00";
  }

  const roundedNum = Math.round(num * 100) / 100;
  const parts = roundedNum.toFixed(2).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const decimalPart = parts[1];

  return `${integerPart},${decimalPart}`;
};
