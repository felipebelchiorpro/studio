
"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
} from "@/components/ui/alert-dialog";

import { Category } from "@/types";
import { fetchCategoriesService, createCategoryService, updateCategoryService, deleteCategoryService } from "@/services/categoryService";
// import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/actions/categories";
import CategoryForm from "@/components/CategoryForm";
import Image from "next/image";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Helper to build tree
  const buildCategoryTree = (cats: Category[]) => {
    const map = new Map<string, Category & { children: Category[] }>();
    const roots: (Category & { children: Category[] })[] = [];

    // Initialize map
    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Build hierarchy
    cats.forEach(cat => {
      if (cat.parentId && map.has(cat.parentId)) {
        map.get(cat.parentId)!.children.push(map.get(cat.id)!);
      } else {
        roots.push(map.get(cat.id)!);
      }
    });

    return roots;
  };

  const handleAddSubClick = (parentId: string) => {
    // Create a template category for the form
    const templateCategory = {
      id: "", // Empty ID signals "New"
      name: "",
      parentId: parentId,
      imageUrl: "",
      type: "supplement" as const, // Default or derived from parent? keeping simple
    };
    setEditingCategory(templateCategory);
    setIsFormOpen(true);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await fetchCategoriesService();
      setCategories(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategoryService(deleteId); // Use Service
      toast({ title: "Categoria removida com sucesso!" });
      loadCategories();
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handleFormSubmit = async (data: Category) => {
    try {

      if (editingCategory && editingCategory.id) {
        // Update
        await updateCategoryService({ ...editingCategory, ...data }); // Use Service
        toast({ title: "Categoria atualizada!" });
      } else {
        // Create
        await createCategoryService(data); // Use Service
        toast({ title: "Categoria criada!" });
      }
      loadCategories();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias da sua loja.</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categorias..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 && searchTerm ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10">
                  Nenhuma categoria encontrada para "{searchTerm}".
                </TableCell>
              </TableRow>
            ) : (
              searchTerm ? (
                // Flat list for search results
                filteredCategories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    level={0}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAddSub={handleAddSubClick}
                  />
                ))
              ) : (
                // Tree structure for default view
                buildCategoryTree(categories).map((node) => (
                  <React.Fragment key={node.id}>
                    <CategoryRow
                      category={node}
                      level={0}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                      onAddSub={handleAddSubClick}
                    />
                    {node.children && node.children.map((child) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        level={1}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onAddSub={handleAddSubClick}
                      />
                    ))}
                  </React.Fragment>
                ))
              )
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        category={editingCategory}
        onSubmitCategory={handleFormSubmit}
        categories={categories}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a categoria
              e pode afetar produtos vinculados a ela.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CategoryRow({ category, level, onEdit, onDelete, onAddSub }: {
  category: Category,
  level: number,
  onEdit: (c: Category) => void,
  onDelete: (id: string) => void,
  onAddSub: (id: string) => void
}) {
  return (
    <TableRow className={level > 0 ? "bg-muted/30" : ""}>
      <TableCell className="font-medium">
        <div style={{ marginLeft: `${level * 24}px` }} className="flex items-center">
          {level > 0 && <span className="text-muted-foreground mr-2">↳</span>}
          {category.name}
        </div>
      </TableCell>
      <TableCell className="text-right space-x-2">
        {level === 0 && (
          <Button
            variant="ghost"
            size="icon"
            title="Adicionar Subcategoria"
            className="text-primary hover:bg-primary/10"
            onClick={() => onAddSub(category.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive/90"
          onClick={() => onDelete(category.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
