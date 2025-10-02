'use server';

/**
 * @fileOverview A Genkit flow for securely processing payments.
 * It performs a fraud analysis, creates a payment intent, and logs the transaction.
 *
 * - paymentFlow - The main function to process a payment.
 */

import { ai } from '@/ai/client';
import { z } from 'zod';
import { createPaymentTool } from './chat-flow';
import { logPayment } from '@/lib/firestore';

const PaymentFlowInputSchema = z.object({
  uid: z.string().describe('The user ID initiating the payment.'),
  amount: z.number().describe('The payment amount.'),
  currency: z.string().describe('The currency of the payment.'),
});

const TransactionAnalysisOutputSchema = z.object({
  risk_score: z
    .number()
    .describe(
      'A risk score from 0 to 100, where a higher score indicates a higher risk of fraud.'
    ),
  reasoning: z
    .string()
    .describe('A brief explanation for the assigned risk score.'),
});

const transactionAnalysisPrompt = ai.definePrompt({
  name: 'transactionAnalysisPrompt',
  input: {
    schema: z.object({
      transaction: PaymentFlowInputSchema,
    }),
  },
  output: { schema: TransactionAnalysisOutputSchema },
  prompt: `You are a fraud detection expert for a financial application.
  Analyze the following transaction details and provide a risk score from 0-100.
  A score above 80 should be considered high risk.
  Consider factors like amount, currency, and user history if available (not provided here, so focus on general patterns).
  Large, unusual amounts should have higher risk scores.

  Transaction:
  - User ID: {{{transaction.uid}}}
  - Amount: {{{transaction.amount}}}
  - Currency: {{{transaction.currency}}}

  Return a JSON object with your analysis.
  `,
});

export const paymentFlow = ai.defineFlow(
  {
    name: 'paymentFlow',
    inputSchema: PaymentFlowInputSchema,
    outputSchema: z.object({
      status: z.enum(['ok', 'flagged', 'error']),
      clientSecret: z.string().optional(),
      message: z.string().optional(),
    }),
  },
  async ({ uid, amount, currency }) => {
    try {
      // 1. Run fraud analysis prompt
      const { output: analysisResult } = await transactionAnalysisPrompt({
        transaction: { uid, amount, currency },
      });

      if (!analysisResult) {
        throw new Error('Fraud analysis failed to produce a result.');
      }

      const { risk_score } = analysisResult;

      // 2. Pause if risk score is high
      if (risk_score > 80) {
        // In a real application, you might use Genkit interrupts here
        // for a human-in-the-loop review.
        console.log(`Transaction flagged for user ${uid} with risk score ${risk_score}`);
        return {
          status: 'flagged',
          message:
            'This transaction has been flagged for review due to a high risk score.',
        };
      }

      // 3. Call tool to create payment intent with Stripe
      const { clientSecret } = await createPaymentTool({ amount, currency });

      if (!clientSecret) {
        throw new Error('Failed to create payment intent.');
      }

      // 4. Write transaction record to Firestore (server-side)
      await logPayment({
        uid,
        amount,
        currency,
        riskScore: risk_score,
        status: 'ok',
      });

      return { status: 'ok', clientSecret };
    } catch (error: any) {
      console.error('Error in payment flow:', error);
      await logPayment({
        uid,
        amount,
        currency,
        riskScore: -1, // Indicate error
        status: 'error',
        error: error.message,
      });
      return { status: 'error', message: 'An unexpected error occurred.' };
    }
  }
);
