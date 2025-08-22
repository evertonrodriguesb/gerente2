'use client';

import { useStore } from '@/hooks/use-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, Boxes, DollarSign, ShoppingBag, TrendingUp, ShoppingCart } from 'lucide-react';
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
  const { products, sales } = useStore();

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalSalesValue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesCount = sales.length;
  const totalGrossProfit = sales.reduce((sum, sale) => sum + sale.grossProfit, 0);
  const totalItemsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          title="Receita Total" 
          value={formatCurrency(totalSalesValue)}
          description="Soma de todas as vendas"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Vendas Realizadas" 
          value={totalSalesCount}
          description="Número total de transações"
          icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Produtos Vendidos" 
          value={totalItemsSold}
          description="Quantidade total de itens vendidos"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard 
          title="Lucro Bruto Total" 
          value={formatCurrency(totalGrossProfit)}
          description="Soma do lucro de todas as vendas"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  );
}
