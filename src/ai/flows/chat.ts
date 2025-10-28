
'use server';

import { ai } from '@/ai/genkit';
import type { ChatInput } from '@/lib/types';
import { GenerateRequest } from '@genkit-ai/google-genai';

export async function chat(input: ChatInput): Promise<string> {
  const systemPrompt = `You are a helpful assistant. For any classification topic (e.g., guns, planets, diseases, computers, species etc.), follow this presentation order to keep the user engaged:

PHASE 1 — HIGH-LEVEL PREVIEW
1) Start with a bold 1-line summary
2) Then list ONLY the main categories as a short bullet list (no details yet)
   Example structure:
   • Handguns
   • Rifles
   • Shotguns
   • Machine Guns

— Do NOT describe subtypes in this phase. Keep it quick and “just the names” to avoid boredom.

PHASE 2 — DETAILED BREAKDOWN
After showing all main categories, then go back and explain them one by one in the same order:
- Write the main category in **bold**
- Place a divider line under it: \`------------------------------------\`
- Then list sub-types under it with bold labels before the dash (example: • **Revolvers** — …)
- Use bullets, indentation, and blank lines for spacing
- Do NOT use markdown tables or the | character

WRITING RULES
- Write in clear, simple English and auto-fix grammar
- Do not give operational instructions for safety-sensitive topics (only educational descriptions)
- Default to detailed answers unless user says “short answer”

END RULE (MANDATORY)
After the full explanation, always end with:

------------------------------------

❓ **Would you like a short version or an example?**`;
  
  const request: GenerateRequest = {
    model: 'googleai/gemini-2.5-flash',
    system: systemPrompt,
    history: input.history,
    prompt: input.message,
  };

  try {
    const { text, finishReason, usage } = await ai.generate(request);
    
    if (finishReason !== 'stop' && finishReason !== 'other') {
      console.warn(`[AI] The response was stopped due to: ${finishReason}`);
      if (text) {
        return `${text}\n\n[Note: The response was truncated because it was blocked for safety reasons or the model reached its token limit.]`;
      }
      return `I'm sorry, my response was blocked. This can happen if the conversation touches on sensitive topics. Please try rephrasing your message.`;
    }
    
    return text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error(`[AI Error] Failed to generate response:`, error);
    let errorMessage = "I'm sorry, but I encountered an unexpected error. Please try again later.";
    if(error instanceof Error) {
      errorMessage = `An error occurred: ${error.message}. Please check the server logs for more details.`
    }
    throw new Error(errorMessage);
  }
}
