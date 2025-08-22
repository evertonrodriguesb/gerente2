'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const { sales, products, addSale, updateSale } = useStore();
  const { toast } = useToast();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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

    const existingCartItem = cart.find(item => item.productId === product.id);
    if (existingCartItem) {
      const newCart = cart.map(item => 
        item.productId === product.id ? {...item, quantity: item.quantity + quantity } : item
      );
      setCart(newCart);
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price: product.price, quantity: quantity }]);
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
    addSale({ items: cart });
    toast({ title: 'Sucesso!', description: 'Venda registrada com sucesso.' });
    setCart([]);
    setIsRegisterDialogOpen(false);
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSaleDate = (date: Date | undefined) => {
    if (editingSale && date) {
      setEditingSale({ ...editingSale, date: date.toISOString() });
    }
  };

  const handleSaveChanges = () => {
    if (editingSale) {
      updateSale(editingSale);
      toast({ title: 'Sucesso!', description: 'Data da venda atualizada.' });
      setIsEditDialogOpen(false);
      setEditingSale(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Vendas</CardTitle>
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                Registrar Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="col-span-2">
                  <Label>Produto</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.filter(p => p.quantity > 0).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.quantity} disp.)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={1} />
                </div>
              </div>
              <Button onClick={handleAddToCart}><PlusCircle className="mr-2 h-4 w-4" />Adicionar Item</Button>

              <div className="mt-4">
                <h3 className="font-semibold mb-2">Itens da Venda:</h3>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead><TableHead>Qtd.</TableHead><TableHead>Preço</TableHead><TableHead>Subtotal</TableHead><TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map(item => (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)}><Trash2 className="h-4 w-4 text-destructive"/></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {cart.length === 0 && <p className="text-center text-sm text-muted-foreground p-4">Nenhum item na venda.</p>}
                </div>
                <div className="text-right mt-2 font-bold text-lg">
                  Total: {formatCurrency(cartTotal)}
                </div>
              </div>
              
              <Button onClick={handleFinalizeSale} disabled={cart.length === 0} className="w-full mt-4"><ShoppingCart className="mr-2 h-4 w-4" />Finalizar Venda</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length > 0 ? sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</TableCell>
                  <TableCell>{formatCurrency(sale.total)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" onClick={() => handleEditSale(sale)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar Venda</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma venda registrada.
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
            <DialogTitle>Editar Data da Venda</DialogTitle>
          </DialogHeader>
          {editingSale && (
            <div className="grid gap-4 py-4">
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
          )}
          <Button onClick={handleSaveChanges} className="w-full">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}