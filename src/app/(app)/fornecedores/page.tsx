'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, Edit, Calendar as CalendarIcon, History } from 'lucide-react';
import type { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ComprasPage() {
  const { products, addPurchase, removeProduct, updateProduct, purchases, categories, addCategory } = useStore();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [newPurchase, setNewPurchase] = useState({
    name: '',
    quantity: 0,
    costPrice: 0,
    salePrice: 0,
    image: '',
    categoryId: '',
    date: new Date(),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPurchase({ ...newPurchase, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPurchase = () => {
    let categoryId = newPurchase.categoryId;
    if (isNewCategory) {
        if (!newCategoryName.trim()) {
            toast({ variant: 'destructive', title: 'Erro!', description: 'Por favor, insira o nome da nova categoria.' });
            return;
        }
        const newCategory = addCategory(newCategoryName);
        categoryId = newCategory.id;
    } else if (!categoryId) {
        toast({ variant: 'destructive', title: 'Erro!', description: 'Por favor, selecione ou crie uma categoria.' });
        return;
    }

    if (newPurchase.name && newPurchase.costPrice > 0 && newPurchase.quantity > 0 && newPurchase.salePrice > 0) {
      addPurchase({...newPurchase, categoryId, date: newPurchase.date.toISOString() });
      toast({ title: 'Sucesso!', description: 'Compra registrada e estoque atualizado.' });
      setNewPurchase({ name: '', quantity: 0, costPrice: 0, salePrice: 0, image: '', categoryId: '', date: new Date() });
      setIsAddDialogOpen(false);
      setIsNewProduct(false);
      setIsNewCategory(false);
      setNewCategoryName("");
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
  
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
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
  
  const getTotalPurchased = (productId: string) => {
    return purchases
      .filter(p => p.productId === productId)
      .reduce((total, purchase) => total + purchase.quantity, 0);
  };

  const getLastPurchaseDate = (productId: string) => {
    const productPurchases = purchases
      .filter(p => p.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (productPurchases.length > 0) {
        return new Date(productPurchases[0].date).toLocaleDateString('pt-BR');
    }
    return '-';
  }

  const handleProductSelect = (value: string) => {
    if (value === 'new') {
      setIsNewProduct(true);
      setNewPurchase({ ...newPurchase, name: '' });
    } else {
      const selectedProduct = products.find(p => p.name === value);
      setIsNewProduct(false);
      setNewPurchase({ 
        ...newPurchase, 
        name: value,
        costPrice: selectedProduct?.costPrice || 0,
        salePrice: selectedProduct?.salePrice || 0,
        categoryId: selectedProduct?.categoryId || '',
       });
    }
  }
  
  const handleCategorySelect = (value: string) => {
    if (value === 'new') {
      setIsNewCategory(true);
      setNewPurchase({ ...newPurchase, categoryId: '' });
    } else {
      setIsNewCategory(false);
      setNewPurchase({ ...newPurchase, categoryId: value });
    }
  }

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.categoryId === selectedCategory);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Registro de Compras</CardTitle>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
             <Link href="/compras">
                <Button size="sm" variant="outline" className="gap-1">
                    <History className="h-3.5 w-3.5" />
                    Histórico
                </Button>
            </Link>
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { setIsAddDialogOpen(isOpen); if(!isOpen) { setIsNewProduct(false); setIsNewCategory(false); setNewCategoryName(''); } }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Registrar Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Compra de Produto</DialogTitle>
                  <DialogDescription className="!mt-2">
                    Caso inserir incorretamente ou esquecer de alguma quantidade, registre outra compra para complementar.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-1 py-2">
                  <div className="grid gap-1">
                    <Label htmlFor="product-select">Produto</Label>
                    <Select onValueChange={handleProductSelect} value={isNewProduct ? 'new' : newPurchase.name}>
                      <SelectTrigger id="product-select">
                        <SelectValue placeholder="Selecione um produto ou crie um novo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Cadastrar novo produto...</SelectItem>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.name}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isNewProduct && (
                    <div className="grid gap-1">
                      <Label htmlFor="name">Nome do Novo Produto</Label>
                      <Input id="name" placeholder="Ex: Camiseta Básica" value={newPurchase.name} onChange={(e) => setNewPurchase({ ...newPurchase, name: e.target.value })} />
                    </div>
                  )}
                  
                  <div className="grid gap-1">
                      <Label htmlFor="category-select">Categoria</Label>
                      <Select onValueChange={handleCategorySelect} value={isNewCategory ? 'new' : newPurchase.categoryId}>
                          <SelectTrigger id="category-select">
                          <SelectValue placeholder="Selecione uma categoria ou crie uma nova" />
                          </SelectTrigger>
                          <SelectContent>
                          <SelectItem value="new">Cadastrar nova categoria...</SelectItem>
                          {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                              {category.name}
                              </SelectItem>
                          ))}
                          </SelectContent>
                      </Select>
                  </div>

                  {isNewCategory && (
                      <div className="grid gap-1">
                          <Label htmlFor="new-category-name">Nome da Nova Categoria</Label>
                          <Input id="new-category-name" placeholder="Ex: Roupas" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                      </div>
                  )}


                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="quantity">Quantidade Comprada</Label>
                      <Input id="quantity" type="number" value={newPurchase.quantity} onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="costPrice">Custo por Unidade (R$)</Label>
                      <Input id="costPrice" type="number" value={newPurchase.costPrice} onChange={(e) => setNewPurchase({ ...newPurchase, costPrice: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1">
                      <Label htmlFor="salePrice">Preço de Venda (R$)</Label>
                      <Input id="salePrice" type="number" value={newPurchase.salePrice} onChange={(e) => setNewPurchase({ ...newPurchase, salePrice: parseFloat(e.target.value) || 0 })} />
                    </div>
                     <div className="grid gap-1">
                      <Label htmlFor="image">Imagem do Produto</Label>
                      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="pt-1" />
                    </div>
                  </div>
                  <div className="grid gap-1">
                      <Label>Data da Compra</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal">
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(newPurchase.date, "PPP", { locale: ptBR })}
                              </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                              <Calendar
                                  mode="single"
                                  selected={newPurchase.date}
                                  onSelect={(date) => date && setNewPurchase({ ...newPurchase, date })}
                                  initialFocus
                                  locale={ptBR}
                              />
                          </PopoverContent>
                      </Popover>
                  </div>
                </div>
                <Button onClick={handleAddPurchase} className="w-full">Salvar Compra</Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Total Comprado</TableHead>
                <TableHead>Preço de Compra</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                        <Image src={product.image} alt={product.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded-md" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{getTotalPurchased(product.id)}</TableCell>
                  <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell>{getLastPurchaseDate(product.id)}</TableCell>
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum produto cadastrado para esta categoria.
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
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Imagem do Produto</Label>
                <Input id="edit-image" type="file" accept="image/*" onChange={handleEditImageChange} className="pt-2"/>
              </div>
            </div>
          )}
          <Button onClick={handleUpdateProduct} className="w-full">Atualizar Produto</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
