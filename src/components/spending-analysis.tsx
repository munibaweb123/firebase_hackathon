'use client';

import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, Lightbulb, Sparkles, Terminal } from 'lucide-react';
import type { Transaction, Budget, SpendingAnalysisData } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface SpendingAnalysisProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface AIResponse {
  spendingAnalysis: string;
  savingsSuggestions: string;
}

export function SpendingAnalysis({ transactions, budgets }: SpendingAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const expenseData = useMemo(() => {
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(expensesByCategory)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [transactions]);

  const handleGetInsights = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);

    const analysisData: SpendingAnalysisData = {
      income: transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: expenseData.map((e) => ({ category: e.name, amount: e.total })),
      budgetLimits: budgets,
    };

    try {
      const spendingInsightsWithAIFlow = httpsCallable(functions, 'spendingInsightsWithAIFlow');
      const response = (await spendingInsightsWithAIFlow(analysisData)).data as any;
      setAiResponse(response);
    } catch (e) {
      console.error(e);
      setError('Failed to get AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>A breakdown of your expenses.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            AI-Powered Financial Insights
          </CardTitle>
          <CardDescription>
            Get personalized analysis of your spending habits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGetInsights} disabled={loading}>
            <Bot className="mr-2 h-4 w-4" />
            {loading ? 'Analyzing...' : 'Get AI Insights'}
          </Button>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {aiResponse && (
            <div className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Spending Analysis</AlertTitle>
                <AlertDescription>{aiResponse.spendingAnalysis}</AlertDescription>
              </Alert>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Savings Suggestions</AlertTitle>
                <AlertDescription>{aiResponse.savingsSuggestions}</AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
