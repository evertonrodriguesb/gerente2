'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ComprasPage() {
  const { products, addPurchase, removeProduct, updateProduct } = useStore();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newPurchase, setNewPurchase] = useState({
    name: '',
    quantity: 0,
    costPrice: 0,
  });

  const handleAddPurchase = () => {
    if (newPurchase.name && newPurchase.costPrice > 0 && newPurchase.quantity > 0) {
      addPurchase(newPurchase);
      toast({ title: 'Sucesso!', description: 'Compra registrada e estoque atualizado.' });
      setNewPurchase({ name: '', quantity: 0, costPrice: 0 });
      setIsAddDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: 'Preencha todos os campos corretamente.' });
    }
  };

  const confirmDeleteProduct = (productId: string) => {
    removeProduct(productId);
    toast({ title: 'Sucesso!', description: 'Produto removido com sucesso.' });
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (editingProduct && editingProduct.name && editingProduct.costPrice >= 0 && editingProduct.quantity >= 0) {
      updateProduct(editingProduct);
      toast({ title: 'Sucesso!', description: 'Produto atualizado com sucesso.' });
      setEditingProduct(null);
      setIsEditDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: 'Preencha os campos obrigatórios.' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registro de Compras</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                Registrar Compra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra de Produto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input id="name" placeholder="Ex: Camiseta Básica" value={newPurchase.name} onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade Comprada</Label>
                    <Input id="quantity" type="number" value={newPurchase.quantity} onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Custo por Unidade (R$)</Label>
                    <Input id="price" type="number" value={newPurchase.costPrice} onChange={(e) => setNewPurchase({ ...newPurchase, costPrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddPurchase} className="w-full">Salvar Compra</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Preço de Compra</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar Produto</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover Produto</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá remover permanentemente o produto "{product?.name}" do seu estoque.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDeleteProduct(product.id)}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input id="edit-name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cost">Custo por Unidade (R$)</Label>
                <Input id="edit-cost" type="number" value={editingProduct.costPrice} onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          )}
          <Button onClick={handleUpdateProduct} className="w-full">Atualizar Produto</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
