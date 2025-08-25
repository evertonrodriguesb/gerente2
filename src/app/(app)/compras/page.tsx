
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Edit, Calendar as CalendarIcon, X } from 'lucide-react';
import type { Purchase } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ComprasHistoricoPage() {
  const { purchases, updatePurchase, categories, getProductById } = useStore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdatePurchaseDate = (date: Date | undefined) => {
    if (editingPurchase && date) {
      setEditingPurchase({ ...editingPurchase, date: date.toISOString() });
    }
  };

  const handleSaveChanges = () => {
    if (editingPurchase) {
      updatePurchase(editingPurchase);
      toast({ title: 'Sucesso!', description: 'Data da compra atualizada.' });
      setIsEditDialogOpen(false);
      setEditingPurchase(null);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    const categoryMatch = selectedCategory === 'all' || getProductById(purchase.productId)?.categoryId === selectedCategory;
    const dateMatch = !selectedDate || (
      purchaseDate.getFullYear() === selectedDate.getFullYear() &&
      purchaseDate.getMonth() === selectedDate.getMonth() &&
      purchaseDate.getDate() === selectedDate.getDate()
    );
    return categoryMatch && dateMatch;
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Histórico de Compras</CardTitle>
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
            <div className="flex items-center gap-2">
              <Popover>
                  <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          locale={ptBR}
                      />
                  </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(undefined)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpar data</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data da Compra</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length > 0 ? filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{formatDate(purchase.date)}</TableCell>
                  <TableCell>{purchase.productName}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>{formatCurrency(purchase.costPrice)}</TableCell>
                  <TableCell>{formatCurrency(purchase.total)}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" onClick={() => handleEditPurchase(purchase)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Editar Compra</span>
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma compra encontrada para os filtros selecionados.
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
            <DialogTitle>Editar Data da Compra</DialogTitle>
          </DialogHeader>
          {editingPurchase && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data da Compra</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(editingPurchase.date), "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editingPurchase.date)}
                      onSelect={handleUpdatePurchaseDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <Button onClick={handleSaveChanges} className="w-full">Salvar Alterações</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
