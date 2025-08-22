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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/lib/types';

export default function ProdutosPage() {
  const { products, addProduct, updateProduct, removeProduct } = useStore();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    salePrice: 0,
    costPrice: 0,
    quantity: 0,
  });

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.salePrice > 0 && newProduct.quantity >= 0) {
      addProduct(newProduct);
      toast({ title: 'Sucesso!', description: 'Produto adicionado com sucesso.' });
      setNewProduct({ name: '', description: '', salePrice: 0, costPrice: 0, quantity: 0 });
      setIsAddDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: 'Preencha os campos obrigatórios.' });
    }
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  }

  const handleUpdateProduct = () => {
    if (editingProduct && editingProduct.name && editingProduct.salePrice > 0 && editingProduct.quantity >= 0) {
      updateProduct(editingProduct);
      toast({ title: 'Sucesso!', description: 'Produto atualizado com sucesso.' });
      setEditingProduct(null);
      setIsEditDialogOpen(false);
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: 'Preencha os campos obrigatórios.' });
    }
  }
  
  const confirmDeleteProduct = (productId: string) => {
    removeProduct(productId);
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Produtos</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço de Venda (R$)</Label>
                    <Input id="price" type="number" value={newProduct.salePrice} onChange={(e) => setNewProduct({ ...newProduct, salePrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input id="quantity" type="number" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddProduct} className="w-full">Salvar Produto</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço de Venda</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                  <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input id="edit-name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea id="edit-description" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Preço de Venda (R$)</Label>
                    <Input id="edit-price" type="number" value={editingProduct.salePrice} onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-cost">Custo (R$)</Label>
                    <Input id="edit-cost" type="number" value={editingProduct.costPrice} onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="edit-quantity">Quantidade</Label>
                    <Input id="edit-quantity" type="number" value={editingProduct.quantity} onChange={(e) => setEditingProduct({ ...editingProduct, quantity: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            )}
            <Button onClick={handleUpdateProduct} className="w-full">Atualizar Produto</Button>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
}
