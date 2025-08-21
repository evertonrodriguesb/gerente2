'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing intelligent product restocking suggestions based on sales history.
 *
 * - sugestaoDeReposicao - A function that triggers the product restocking suggestion flow.
 * - SugestaoDeReposicaoInput - The input type for the sugestaoDeReposicao function.
 * - SugestaoDeReposicaoOutput - The return type for the sugestaoDeReposicao function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SugestaoDeReposicaoInputSchema = z.object({
  salesHistory: z
    .string()
    .describe('The sales history data, including product names, quantities sold, and dates.'),
  currentStockLevels: z
    .string()
    .describe('The current stock levels for each product in the store.'),
  storeName: z.string().describe('The name of the store.'),
});
export type SugestaoDeReposicaoInput = z.infer<typeof SugestaoDeReposicaoInputSchema>;

const SugestaoDeReposicaoOutputSchema = z.object({
  restockSuggestions: z
    .string()
    .describe('A list of products to restock, with suggested quantities, and reasoning for each suggestion.'),
});
export type SugestaoDeReposicaoOutput = z.infer<typeof SugestaoDeReposicaoOutputSchema>;

export async function sugestaoDeReposicao(input: SugestaoDeReposicaoInput): Promise<SugestaoDeReposicaoOutput> {
  return sugestaoDeReposicaoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sugestaoDeReposicaoPrompt',
  input: {schema: SugestaoDeReposicaoInputSchema},
  output: {schema: SugestaoDeReposicaoOutputSchema},
  prompt: `Você é um especialista em gestão de estoque e vendas no varejo.

Com base no histórico de vendas e nos níveis de estoque atuais da loja {{{storeName}}}, forneça sugestões de reposição de produtos para garantir que os itens mais procurados estejam sempre em estoque e evitar a falta de produtos.

Histórico de Vendas:
{{salesHistory}}

Níveis de Estoque Atuais:
{{currentStockLevels}}

Sugestões de Reposição (inclua quantidades sugeridas e justifique cada sugestão):
`, // Respondendo em português do brasil
});

const sugestaoDeReposicaoFlow = ai.defineFlow(
  {
    name: 'sugestaoDeReposicaoFlow',
    inputSchema: SugestaoDeReposicaoInputSchema,
    outputSchema: SugestaoDeReposicaoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
