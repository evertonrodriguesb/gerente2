
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, ShoppingCart, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';
import type { Sale, SaleItem } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VendasPage() {
  const { sales, products, addSale, updateSale, removeSale, categories, getProductById } = useStore();
  const { toast } = useToast();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um produto.' });
      return;
    }
    if (quantity <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'A quantidade deve ser positiva.' });
      return;
    }
    if (quantity > product.quantity) {
      toast({ variant: 'destructive', title: 'Erro', description: `Estoque insuficiente. Disponível: ${product.quantity}` });
      return;
    }

    const existingCartItemIndex = cart.findIndex(item => item.productId === product.id);
    if (existingCartItemIndex > -1) {
      const newCart = [...cart];
      const newQuantity = newCart[existingCartItemIndex].quantity + quantity;
      if(newQuantity > product.quantity) {
        toast({ variant: 'destructive', title: 'Erro', description: `Estoque insuficiente. Disponível: ${product.quantity}` });
        return;
      }
      newCart[existingCartItemIndex].quantity = newQuantity;
      setCart(newCart);
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price: product.salePrice, costPrice: product.costPrice, quantity: quantity }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };
  
  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  }

  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Adicione produtos ao carrinho.' });
      return;
    }
    addSale({ items: cart, discount });
    toast({ title: 'Sucesso!', description: 'Venda registrada com sucesso.' });
    setCart([]);
    setDiscount(0);
    setIsRegisterDialogOpen(false);
  };

  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartTotal = cartSubtotal - discount;

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSaleDate = (date: Date | undefined) => {
    if (editingSale && date) {
      const currentSaleDate = new Date(editingSale.date);
      date.setHours(currentSaleDate.getHours());
      date.setMinutes(currentSaleDate.getMinutes());
      date.setSeconds(currentSaleDate.getSeconds());
      setEditingSale({ ...editingSale, date: date.toISOString() });
    }
  };
  
  const handleUpdateSaleTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(editingSale) {
        const time = e.target.value;
        const [hoursStr, minutesStr] = time.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        const newDate = new Date(editingSale.date);

        if (!isNaN(hours) && hours >= 0 && hours <= 23) {
            newDate.setHours(hours);
        }
        if (!isNaN(minutes) && minutes >= 0 && minutes <= 59) {
            newDate.setMinutes(minutes);
        }
        
        setEditingSale({ ...editingSale, date: newDate.toISOString() });
    }
  }

  const handleSaveChanges = () => {
    if (editingSale) {
      updateSale(editingSale);
      toast({ title: 'Sucesso!', description: 'Data da venda atualizada.' });
      setIsEditDialogOpen(false);
      setEditingSale(null);
    }
  };

  const confirmDeleteSale = (saleId: string) => {
    removeSale(saleId);
  }

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.image;
  }

  const filteredSales = selectedCategory === 'all'
    ? sales
    : sales.filter(sale => 
        sale.items.some(item => {
          const product = getProductById(item.productId);
          return product?.categoryId === selectedCategory;
        })
      );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Histórico de Vendas</CardTitle>
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
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="grid gap-2 flex-grow">
                    <Label>Produto</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.quantity > 0).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              {p.image ? (
                                  <Image src={p.image} alt={p.name} width={24} height={24} className="rounded-sm object-cover h-6 w-6" />
                              ) : (
                                <div className="h-6 w-6 bg-muted rounded-sm" />
                              )}
                              {p.name} ({p.quantity} disp.)
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 w-24">
                    <Label>Quantidade</Label>
                    <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} />
                  </div>
                </div>
                
                <Button onClick={handleAddToCart} className="w-full"><PlusCircle className="mr-2 h-4 w-4" />Adicionar Item</Button>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Itens da Venda:</h3>
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Qtd.</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cart.length > 0 ? cart.map(item => (
                          <TableRow key={item.productId}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.price)}</TableCell>
                            <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                           <TableRow>
                              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-4">
                                Nenhum item na venda.
                              </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                         <Label htmlFor="discount" className="text-muted-foreground text-sm font-normal">
                            Desconto (R$):
                          </Label>
                          <Input 
                            id="discount"
                            type="number" 
                            value={discount} 
                            onChange={e => setDiscount(Math.max(0, Number(e.target.value)))} 
                            className="w-24 h-9"
                          />
                    </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="text-xl font-bold">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleFinalizeSale} disabled={cart.length === 0} className="w-full mt-2"><ShoppingCart className="mr-2 h-4 w-4" />Finalizar Venda</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Data da Venda</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Lucro Bruto</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? filteredSales.map((sale) => {
                const firstItemImage = sale.items.length > 0 ? getProductImage(sale.items[0].productId) : null;
                const totalItems = sale.items.reduce((total, item) => total + item.quantity, 0);
                return (
                <TableRow key={sale.id}>
                   <TableCell>
                    {firstItemImage ? (
                        <Image src={firstItemImage} alt={sale.items[0].productName} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded-md" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.items.map(i => i.productName).join(', ')}</TableCell>
                  <TableCell>{totalItems}</TableCell>
                  <TableCell>{formatCurrency(sale.discount || 0)}</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>{formatCurrency(sale.grossProfit)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditSale(sale)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar Venda</span>
                    </Button>
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover Venda</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá remover permanentemente a venda e retornar os itens ao estoque.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => confirmDeleteSale(sale.id)}>Continuar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )}) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhuma venda registrada para esta categoria.
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
            <DialogTitle>Editar Data e Hora da Venda</DialogTitle>
          </DialogHeader>
          {editingSale && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data da Venda</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(editingSale.date), "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editingSale.date)}
                      onSelect={handleUpdateSaleDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sale-time">Hora da Venda (HH:MM)</Label>
                <Input
                  id="sale-time"
                  type="text"
                  placeholder="HH:MM"
                  value={format(new Date(editingSale.date), 'HH:mm')}
                  onChange={handleUpdateSaleTime}
                />
              </div>
            </div>
          )}
          <Button onClick={handleSaveChanges} className="w-full">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
