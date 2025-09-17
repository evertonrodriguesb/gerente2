
'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreatableSelect } from '@/components/creatable-select'; // Assuming this component exists

export default function ComprasPage() {
  const { purchases, addPurchase, categories, addCategory, getCategoryById } = useStore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New Purchase State
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const resetForm = () => {
    setProductName('');
    setQuantity(1);
    setCostPrice(0);
    setSalePrice(0);
    setDate(new Date());
    setCategoryId(undefined);
  };

  const handleFinalizePurchase = async () => {
    if (!productName || quantity <= 0 || costPrice <= 0 || salePrice <= 0 || !date) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    try {
      await addPurchase({
        name: productName,
        quantity,
        costPrice,
        salePrice,
        categoryId, // Pass the categoryId to the addPurchase function
        date: date.toISOString(),
      });

      toast({ title: 'Sucesso!', description: 'Compra registrada com sucesso.' });
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to add purchase:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível registrar a compra.' });
    }
  };

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  const handleCreateCategory = async (inputValue: string) => {
    try {
        const newCategory = await addCategory(inputValue);
        setCategoryId(newCategory.id);
    } catch (error) {
        console.error('Failed to create category:', error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar a nova categoria.' });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Histórico de Compras</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <PlusCircle className="h-3.5 w-3.5" />
                Registrar Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Nova Compra</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="product-name">Nome do Produto</Label>
                  <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Ex: Coca-Cola 2L" />
                </div>
                 <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <CreatableSelect
                        placeholder="Selecione ou crie uma categoria"
                        options={categoryOptions}
                        value={categoryOptions.find(c => c.value === categoryId)}
                        onChange={(option) => setCategoryId(option?.value)}
                        onCreateOption={handleCreateCategory}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} />
                  </div>
                  <div className="grid gap-2">
                     <Label>Data da Compra</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cost-price">Preço de Custo (Unitário)</Label>
                        <Input id="cost-price" type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} placeholder="R$ 5.00" min={0} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sale-price">Preço de Venda (Unitário)</Label>
                        <Input id="sale-price" type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} placeholder="R$ 8.00" min={0}/>
                    </div>
                </div>
              </div>
              <Button onClick={handleFinalizePurchase} className="w-full">Salvar Compra</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Unit.</TableHead>
                <TableHead>Custo Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.length > 0 ? purchases.map((purchase) => {
                const category = getCategoryById(purchase.productId) 
                return (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.productName}</TableCell>
                    <TableCell>{getCategoryById(purchase.productId)?.name ?? 'Sem Categoria'}</TableCell>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>{formatCurrency(purchase.costPrice)}</TableCell>
                    <TableCell>{formatCurrency(purchase.total)}</TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma compra registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
