import { config } from 'dotenv';
config();

import '@/ai/flows/auto-name-chat.ts';
import '@/ai/flows/chat.ts';
import '@/ai/flows/summarize-chat-history.ts';
import '@/ai/flows/enhance-user-query.ts';
import '@/ai/flows/smart-chat-title.ts';
import '@/ai/flows/topic-suggestion.ts';