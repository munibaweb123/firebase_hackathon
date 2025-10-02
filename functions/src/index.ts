import { initializeApp } from 'firebase-admin/app';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { onCallGenkit } from '@genkit-ai/firebase/functions';
import { z } from 'zod';
import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';
import { stripe } from './stripe';
import wav from 'wav';
import { allCategories, expenseCategories, incomeCategories } from './data';

initializeApp();
const db = getFirestore();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
});

// Hello Flow
const HelloInputSchema = z.object({
  name: z.string().describe('The name to include in the greeting.'),
});
const HelloOutputSchema = z.object({
  greeting: z.string().describe('The generated greeting message.'),
});
const helloFlow = ai.defineFlow(
  {
    name: 'helloFlow',
    inputSchema: HelloInputSchema,
    outputSchema: HelloOutputSchema,
  },
  async ({ name }) => {
    const llmResponse = await ai.generate({
      prompt: `Hello Gemini, my name is ${name}`,
    });
    const text = llmResponse.text;
    return { greeting: text };
  }
);
export const helloFlowFn = functions.https.onCall(onCallGenkit(ai, helloFlow));


// Speech To Text Flow
const TranscribeAudioInputSchema = z.object({
  audio: z.string().describe("Audio data as a data URI with a MIME type. E.g., 'data:audio/webm;base64,...'"),
});
const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [{ media: { url: input.audio } }, { text: 'Transcribe the audio.' }],
    });
    const text = llmResponse.text;
    if (!text) return { text: '' };
    return { text };
  }
);
export const transcribeAudioFlowFn = functions.https.onCall(onCallGenkit(ai, transcribeAudioFlow));

// Categorize Transaction Flow
const CategorizeTransactionInputSchema = z.object({
  text: z.string().describe('The natural language text describing a transaction, including amount, merchant, and description.'),
});
const CategorizeTransactionOutputSchema = z.object({
  description: z.string().describe('A concise description of the transaction.'),
  amount: z.number().describe('The numerical amount of the transaction.'),
  category: z.enum(allCategories as [string, ...string[]]).describe('The most likely category for this transaction.'),
});
const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: { schema: CategorizeTransactionInputSchema },
  output: { schema: CategorizeTransactionOutputSchema },
  prompt: `You are the Auto Categorization Agent. Analyze the following text and extract transaction details.
  The currency is USD. Assign one category from this list for expenses: ${expenseCategories.join(', ')}.
  For income, use categories like Salary, Freelance, etc. If unsure, choose "Other".
  Text: {{{text}}}`,
});
const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async (input) => {
    const { output } = await categorizeTransactionPrompt(input);
    return output!;
  }
);
export const categorizeTransactionFlowFn = functions.https.onCall(onCallGenkit(ai, categorizeTransactionFlow));

// Chat Flow
async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

const addTransactionTool = ai.defineTool(
    {
      name: 'addTransaction',
      description: 'Use this to add a new income or expense transaction. The input should be a natural language description of the transaction (e.g., "I just spent $10 on coffee" or "received 2000 for my salary").',
      inputSchema: z.object({
        userId: z.string().optional(),
        transactionText: z.string().describe('The natural language description of the transaction.'),
      }),
      outputSchema: z.object({ success: z.boolean(), message: z.string(), data: z.any().optional() }),
    },
    async ({ userId, transactionText }) => {
      if (!userId) return { success: false, message: "Please provide your User ID." };
      try {
        const categorized = await categorizeTransactionFlow({ text: transactionText });
        if (!categorized.category || !categorized.amount) {
          return { success: false, message: "I couldn't figure out the details." };
        }
        const confirmationMessage = `You spent $${categorized.amount} on ${categorized.description}, correct?`;
        return { success: true, message: confirmationMessage, data: categorized };
      } catch (error: any) {
        console.error('Tool error:', error);
        return { success: false, message: "I'm sorry, there was an issue." };
      }
    }
  );

const createPaymentTool = ai.defineTool(
    {
      name: 'createPaymentIntent',
      description: 'Create a Stripe PaymentIntent and return client_secret',
      inputSchema: z.object({
        amount: z.number().int(),
        currency: z.string().default('usd'),
        customerId: z.string().optional(),
        metadata: z.record(z.string()).optional(),
      }),
      outputSchema: z.object({ clientSecret: z.string() }),
    },
    async ({ amount, currency, customerId, metadata }) => {
      const pi = await stripe.paymentIntents.create({ amount, currency, customer: customerId, payment_method_types: ['card'], metadata });
      return { clientSecret: pi.client_secret! };
    }
  );

const ChatInputSchema = z.object({
    userId: z.string(),
    history: z.array(z.object({ role: z.enum(['user', 'model']), content: z.string() })),
    message: z.string().describe("The user's message to the AI."),
    pastTransactions: z.array(z.any()),
    budgets: z.array(z.any()),
});
const ChatOutputSchema = z.object({
    message: z.string().describe("The AI's response message."),
    audio: z.string().describe("The base64 encoded WAV audio of the AI's response."),
});
const chatFlow = ai.defineFlow(
    { name: 'chatFlow', inputSchema: ChatInputSchema, outputSchema: ChatOutputSchema },
    async (input) => {
      try {
        const history = input.history.map((msg) => ({ role: msg.role, content: [{ text: msg.content }] }));
        const cleanedMessage = input.message.replace(/\\[.*?\\]/g, '').trim();
        const llmResponse = await ai.generate({
          history,
          prompt: cleanedMessage,
          tools: [addTransactionTool, createPaymentTool],
          toolConfig: {
            custom: (toolRequest) => {
              if (toolRequest.name === 'addTransaction') toolRequest.input.userId = input.userId;
              return toolRequest;
            },
          },
          config: { maxOutputTokens: 256 },
          system: `You are Wally, a friendly financial assistant.`,
        });
        const responseText = llmResponse.text;
        const fallbackMessage = "I didn’t quite get that. Can you rephrase?";
        
        async function generateAudio(text: string): Promise<string> {
          try {
            const { media } = await ai.generate({
              model: 'googleai/gemini-2.5-flash-preview-tts',
              config: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'achernar' } } } },
              prompt: text,
            });
            if (!media) return '';
            const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
            const wavBase64 = await toWav(audioBuffer);
            return `data:audio/wav;base64,${wavBase64}`;
          } catch (error) {
            console.error('Error generating audio:', error);
            return '';
          }
        }

        if (llmResponse.toolRequests.length > 0) {
          const toolResponse = llmResponse.toolRequests[0];
          const toolResult = await addTransactionTool(toolResponse.input);
          const messageToUser = toolResult.message;
          const responseAudio = await generateAudio(messageToUser);
          return { message: messageToUser, audio: responseAudio };
        }

        if (!responseText || responseText.trim() === '') {
          return { message: fallbackMessage, audio: '' };
        }
        
        const responseAudio = await generateAudio(responseText);
        return { message: responseText, audio: responseAudio };
      } catch (error) {
        console.error('An unexpected error occurred in the chat flow:', error);
        return { message: 'Sorry, I ran into an unexpected issue.', audio: '' };
      }
    }
  );
export const chatFlowFn = functions.https.onCall(onCallGenkit(ai, chatFlow));


// Spending Insights Flow
const SpendingInsightsWithAIInputSchema = z.object({
  income: z.number().describe('The total income for the period.'),
  expenses: z.array(z.object({ category: z.string(), amount: z.number() })).describe('An array of expenses.'),
  budgetLimits: z.array(z.object({ category: z.string(), limit: z.number() })).describe('An array of budget limits.'),
});
const SpendingInsightsWithAIOutputSchema = z.object({
  spendingAnalysis: z.string().describe('A detailed analysis of spending patterns.'),
  savingsSuggestions: z.string().describe('Specific suggestions for saving money.'),
});
const spendingInsightsAIPrompt = ai.definePrompt({
  name: 'spendingInsightsAIPrompt',
  input: { schema: SpendingInsightsWithAIInputSchema },
  output: { schema: SpendingInsightsWithAIOutputSchema },
  prompt: `Analyze the following financial data and provide a detailed spending analysis and actionable savings suggestions.
  Income: {{{income}}}
  Expenses:
  {{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
  {{/each}}
  Budget Limits:
  {{#each budgetLimits}}
  - Category: {{{category}}}, Limit: {{{limit}}}
  {{/each}}`,
});
const spendingInsightsWithAIFlow = ai.defineFlow(
  { name: 'spendingInsightsWithAIFlow', inputSchema: SpendingInsightsWithAIInputSchema, outputSchema: SpendingInsightsWithAIOutputSchema },
  async (input) => {
    const { output } = await spendingInsightsAIPrompt(input);
    return output!;
  }
);
export const spendingInsightsWithAIFlowFn = functions.https.onCall(onCallGenkit(ai, spendingInsightsWithAIFlow));


// Transaction Manager Flow
const ProcessTransactionInputSchema = z.object({
  rawInput: z.string().describe('The raw text input describing the transaction.'),
  pastTransactions: z.array(z.any()).describe("A list of the user's past transactions."),
  budgets: z.array(z.any()).describe("The user's current budget limits."),
});
const ProcessTransactionOutputSchema = z.object({
  transaction: z.object({ description: z.string(), amount: z.number() }),
  category: z.enum(allCategories as [string, ...string[]]),
  recurring: z.boolean(),
  insights: z.array(z.string()),
  alerts: z.array(z.string()),
});
const transactionManagerFlow = ai.defineFlow(
  { name: 'transactionManagerFlow', inputSchema: ProcessTransactionInputSchema, outputSchema: ProcessTransactionOutputSchema },
  async ({ rawInput, pastTransactions, budgets }) => {
    const categorized = await categorizeTransactionFlow({ text: rawInput });
    const newTransaction = { description: categorized.description, amount: categorized.amount, category: categorized.category };
    
    // Recurring Expense Check (simplified)
    const recurringKeywords = ['netflix', 'rent', 'gym', 'spotify', 'subscription', 'membership'];
    const isRecurring = recurringKeywords.some(keyword => newTransaction.description.toLowerCase().includes(keyword));
    
    // Insights Generation
    const income = pastTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const currentMonthExpenses = pastTransactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((acc, t) => {
            const item = acc.find(item => item.category === t.category);
            if (item) item.amount += t.amount;
            else acc.push({ category: t.category, amount: t.amount });
            return acc;
        }, [] as { category: string; amount: number }[]);
    const insightsResult = await spendingInsightsWithAIFlow({ income, expenses: currentMonthExpenses, budgetLimits: budgets });

    // Budget Alert Check (simplified)
    let alerts: string[] = [];
    const budgetForCategory = budgets.find(b => b.category === categorized.category);
    if (budgetForCategory) {
        const totalSpent = (currentMonthExpenses.find(e => e.category === categorized.category)?.amount || 0) + newTransaction.amount;
        const spendingRatio = totalSpent / budgetForCategory.limit;
        if (spendingRatio >= 1) alerts.push(`🚨 You have exceeded your budget for ${categorized.category}.`);
        else if (spendingRatio >= 0.8) alerts.push(`⚠️ You have spent ${Math.round(spendingRatio * 100)}% of your ${categorized.category} budget.`);
    }

    return {
      transaction: { description: newTransaction.description, amount: newTransaction.amount },
      category: newTransaction.category as any,
      recurring: isRecurring,
      insights: [insightsResult.spendingAnalysis, insightsResult.savingsSuggestions].filter(Boolean),
      alerts: alerts,
    };
  }
);
export const transactionManagerFlowFn = functions.https.onCall(onCallGenkit(ai, transactionManagerFlow));

// Payment Flow
const PaymentFlowInputSchema = z.object({
  uid: z.string().describe('The user ID initiating the payment.'),
  amount: z.number().describe('The payment amount.'),
  currency: z.string().describe('The currency of the payment.'),
});
const TransactionAnalysisOutputSchema = z.object({
  risk_score: z.number().describe('A risk score from 0 to 100.'),
  reasoning: z.string().describe('A brief explanation for the assigned risk score.'),
});
const transactionAnalysisPrompt = ai.definePrompt({
  name: 'transactionAnalysisPrompt',
  input: { schema: z.object({ transaction: PaymentFlowInputSchema }) },
  output: { schema: TransactionAnalysisOutputSchema },
  prompt: `Analyze the following transaction and provide a risk score. A score above 80 is high risk.
  Transaction:
  - User ID: {{{transaction.uid}}}
  - Amount: {{{transaction.amount}}}
  - Currency: {{{transaction.currency}}}
  Return a JSON object with your analysis.`,
});
const paymentFlow = ai.defineFlow(
  {
    name: 'paymentFlow',
    inputSchema: PaymentFlowInputSchema,
    outputSchema: z.object({ status: z.enum(['ok', 'flagged', 'error']), clientSecret: z.string().optional(), message: z.string().optional() }),
  },
  async ({ uid, amount, currency }) => {
    try {
      const { output: analysisResult } = await transactionAnalysisPrompt({ transaction: { uid, amount, currency } });
      if (!analysisResult) throw new Error('Fraud analysis failed.');
      const { risk_score } = analysisResult;
      if (risk_score > 80) {
        console.log(`Transaction flagged for user ${uid} with risk score ${risk_score}`);
        return { status: 'flagged', message: 'This transaction has been flagged for review.' };
      }
      const { clientSecret } = await createPaymentTool({ amount, currency });
      if (!clientSecret) throw new Error('Failed to create payment intent.');
      await db.collection('users').doc(uid).collection('payments').add({ uid, amount, currency, riskScore: risk_score, status: 'ok', createdAt: new Date() });
      return { status: 'ok', clientSecret };
    } catch (error: any) {
      console.error('Error in payment flow:', error);
      await db.collection('users').doc(uid).collection('payments').add({ uid, amount, currency, riskScore: -1, status: 'error', error: error.message, createdAt: new Date() });
      return { status: 'error', message: 'An unexpected error occurred.' };
    }
  }
);
export const paymentFlowFn = functions.https.onCall(onCallGenkit(ai, paymentFlow));
