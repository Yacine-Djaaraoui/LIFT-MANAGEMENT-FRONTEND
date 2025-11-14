import React, { useState } from "react";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ProductForm } from "@/components/ProductForm";

export const Stock: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    search: searchTerm,
    page: currentPage.toString(),
    page_size: "10",
    ordering: "-created_at",
  });

  const deleteMutation = useDeleteProduct();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        Erreur lors du chargement des produits
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Gestion du Stock</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Produit
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Prix d'achat</TableHead>
              <TableHead>Prix de vente</TableHead>
              {/* <TableHead>Marge</TableHead> */}
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : productsData?.results?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Aucun produit trouvé
                </TableCell>
              </TableRow>
            ) : (
              productsData?.results?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>
                        {product.quantity} {product.unit}
                      </span>
                      {product.is_low_stock && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.buying_price} DA</TableCell>
                  <TableCell>{product.selling_price} DA</TableCell>
                  {/* <TableCell>
                    {product.calculate_profit_margin?.toFixed(2)}%
                  </TableCell> */}
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_low_stock
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.is_low_stock ? "Stock faible" : "En stock"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer le produit
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer le produit "
                              {product.name}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {productsData && productsData.count > 10 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Affichage de {(currentPage - 1) * 10 + 1} à{" "}
            {Math.min(currentPage * 10, productsData.count)} sur{" "}
            {productsData.count} produits
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              disabled={!productsData.next}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductForm
        open={isFormOpen}
        onClose={handleFormClose}
        product={editingProduct}
      />
    </div>
  );
};
