
'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/use-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package, Boxes, DollarSign, ShoppingBag, TrendingUp, ShoppingCart, Archive, Trash2, BadgePercent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ReactElement, FC } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactElement;
  description: string;
}

const StatCard: FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { products, sales, purchases, clearData } = useStore();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const availableYears = Array.from(new Set([
    ...purchases.map(p => new Date(p.date).getFullYear().toString()),
    ...sales.map(s => new Date(s.date).getFullYear().toString())
  ])).sort((a, b) => parseInt(b) - parseInt(a));

  const availableMonths = [
    { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' }
  ];

  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const monthMatch = selectedMonth === 'all' || (saleDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || saleDate.getFullYear().toString() === selectedYear;
    return monthMatch && yearMatch;
  });

  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.date);
    const monthMatch = selectedMonth === 'all' || (purchaseDate.getMonth() + 1).toString() === selectedMonth;
    const yearMatch = selectedYear === 'all' || purchaseDate.getFullYear().toString() === selectedYear;
    return monthMatch && yearMatch;
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalStockValue = products.reduce((sum, product) => sum + (product.costPrice * product.quantity), 0);
  
  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesCount = filteredSales.length;
  const totalGrossProfit = filteredSales.reduce((sum, sale) => sum + sale.grossProfit, 0);
  const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const totalPurchasesValue = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const totalDiscounts = filteredSales.reduce((sum, sale) => sum + (sale.discount || 0), 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {availableYears.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Essa ação não pode ser desfeita. Isso irá apagar permanentemente todos os produtos, vendas e compras. Os dados iniciais serão restaurados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={clearData}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard 
          title="Total de Produtos" 
          value={totalProducts}
          description="Tipos de produtos cadastrados"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Itens em Estoque" 
          value={totalStock}
          description="Quantidade total de itens"
          icon={<Boxes className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Valor do Estoque" 
          value={formatCurrency(totalStockValue)}
          description="Soma do custo do estoque"
          icon={<Archive className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Valor Total de Compras" 
          value={formatCurrency(totalPurchasesValue)}
          description="Soma de produtos comprados no período"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
         <StatCard 
          title="Vendas Realizadas" 
          value={totalSalesCount}
          description="Transações no período"
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Produtos Vendidos" 
          value={totalItemsSold}
          description="Itens vendidos no período"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Receita Total" 
          value={formatCurrency(totalSalesValue)}
          description="Soma das vendas no período"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Total em Descontos" 
          value={formatCurrency(totalDiscounts)}
          description="Descontos concedidos no período"
          icon={<BadgePercent className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Lucro Bruto Total" 
          value={formatCurrency(totalGrossProfit)}
          description="Lucro das vendas no período"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
}
