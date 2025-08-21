'use client';

import { useState, useTransition } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { sugestaoDeReposicao } from '@/ai/flows/sugestao-de-reposicao';
import { BrainCircuit } from 'lucide-react';

export default function ReposicaoPage() {
  const { products, sales, getProductById } = useStore();
  const [suggestion, setSuggestion] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleGenerateSuggestion = () => {
    startTransition(async () => {
      const salesHistory = sales.map(sale => 
        `Venda em ${new Date(sale.date).toLocaleDateString('pt-BR')}: ` +
        sale.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')
      ).join('\n');
      
      const currentStockLevels = products.map(p => `${p.name}: ${p.quantity} em estoque`).join('\n');
      
      try {
        const result = await sugestaoDeReposicao({
          salesHistory: salesHistory || "Nenhuma venda registrada.",
          currentStockLevels: currentStockLevels || "Nenhum produto em estoque.",
          storeName: 'Gerente Ágil',
        });
        setSuggestion(result.restockSuggestions);
      } catch (error) {
        console.error(error);
        setSuggestion("Ocorreu um erro ao gerar a sugestão. Tente novamente.");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestão de Reposição com IA</CardTitle>
        <CardDescription>
          Use nossa inteligência artificial para analisar seu histórico de vendas e estoque atual,
          recebendo sugestões inteligentes sobre quais produtos repor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : suggestion ? (
          <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted/50 p-4">
            <p>{suggestion}</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
            <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
            <p>Sua sugestão aparecerá aqui.</p>
            <p>Clique no botão abaixo para começar.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateSuggestion} disabled={isPending}>
          {isPending ? 'Analisando dados...' : 'Gerar Sugestão'}
        </Button>
      </CardFooter>
    </Card>
  );
}
