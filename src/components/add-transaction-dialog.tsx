
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TransactionData } from '@/lib/types';
import { expenseCategories, incomeCategories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction-flow';
import { Separator } from './ui/separator';
import { Label } from './ui/label';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdd: (transaction: string | TransactionData) => void;
}

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'Description must be at least 2 characters.',
  }),
  amount: z.coerce.number().positive({
    message: 'Amount must be a positive number.',
  }),
  type: z.enum(['income', 'expense'], {
    required_error: 'You need to select a transaction type.',
  }),
  category: z.string({
    required_error: 'Please select a category.',
  }),
  date: z.date({
    required_error: 'A date is required.',
  }),
});

export function AddTransactionDialog({
  open,
  onOpenChange,
  onTransactionAdd,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      date: new Date(),
    },
  });
  
  const transactionType = useWatch({
    control: form.control,
    name: 'type',
  });

  const categories = transactionType === 'income' ? incomeCategories : expenseCategories;


  const handleAiCategorize = async () => {
    if (!naturalLanguageInput) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please describe your transaction first.',
      });
      return;
    }
    setAiLoading(true);
    try {
      // Use the full AI agent workflow
      onTransactionAdd(naturalLanguageInput);
      setNaturalLanguageInput('');
      form.reset();
      onOpenChange(false);
    } catch (error) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Processing Failed',
        description: 'Could not process the transaction using AI. Please fill it manually.',
      });
    } finally {
      setAiLoading(false);
    }
  };


  function onManualSubmit(values: z.infer<typeof formSchema>) {
    onTransactionAdd(values);
    form.reset();
    setNaturalLanguageInput('');
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Describe your transaction for the AI to process it, or fill the form manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="natural-language-input">AI-Powered Entry</Label>
               <div className="flex items-center gap-2">
                <Input
                  id="natural-language-input"
                  placeholder="e.g., spent 25 dollars on lunch with friends"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  disabled={aiLoading}
                />
                <Button onClick={handleAiCategorize} disabled={aiLoading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {aiLoading ? 'Processing...' : 'Process'}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <p className="text-center text-sm text-muted-foreground">Or add manually</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Coffee with a friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('category', ''); // Reset category on type change
                        }}
                        value={field.value}
                        className="flex items-center space-x-4 pt-1"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="expense" />
                          </FormControl>
                          <FormLabel className="font-normal">Expense</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="income" />
                          </FormControl>
                          <FormLabel className="font-normal">Income</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save Transaction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
