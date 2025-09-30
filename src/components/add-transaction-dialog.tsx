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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { TransactionData } from '@/lib/types';
import { categories } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction-flow';
import { Separator } from './ui/separator';
import { Label } from './ui/label';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdd: (transaction: TransactionData) => void;
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

  const handleCategorize = async () => {
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
      const result = await categorizeTransaction({ text: naturalLanguageInput });
      if (result) {
        form.setValue('description', result.description);
        form.setValue('amount', result.amount);
        form.setValue('category', result.category);
        toast({
          title: 'Success!',
          description: 'Transaction details have been filled in.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'AI Categorization Failed',
        description: 'Could not categorize the transaction. Please fill it manually.',
      });
    } finally {
      setAiLoading(false);
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {
    onTransactionAdd(values);
    toast({
      title: 'Success!',
      description: 'Your transaction has been added.',
    });
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
            You can describe your transaction for the AI to categorize, or fill it manually.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="natural-language-input">Describe Transaction</Label>
               <div className="flex items-center gap-2">
                <Input
                  id="natural-language-input"
                  placeholder="e.g., spent 25 dollars on lunch"
                  value={naturalLanguageInput}
                  onChange={(e) => setNaturalLanguageInput(e.target.value)}
                  disabled={aiLoading}
                />
                <Button onClick={handleCategorize} disabled={aiLoading}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {aiLoading ? 'Analyzing...' : 'Categorize'}
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

            <p className="text-center text-sm text-muted-foreground">Or add manually</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
