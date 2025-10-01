import { config } from 'dotenv';
config();

import '@/ai/flows/spending-insights-ai.ts';
import '@/ai/flows/suggested-savings-plans.ts';
import '@/ai/flows/chat-flow.ts';
import '@/ai/flows/speech-to-text-flow.ts';
import '@/ai/flows/categorize-transaction-flow.ts';
import '@/ai/flows/recurring-expense-agent.ts';
import '@/ai/flows/budget-alert-agent.ts';
import '@/ai/flows/transaction-manager-flow.ts';
import '@/ai/flows/hello-flow.ts';
