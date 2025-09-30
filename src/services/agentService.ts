import Groq from 'groq-sdk';
import { tools } from '@/config/agentTools';
import { getRagResponse } from '@/utilities/rag/ragService';
import { createPostInSkylink, getSkylinkProfile, updateSkylinkProfile } from '@/services/actionService';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function updateProfileViaAPI(updates: any, userId: string): Promise<string> {
  try {
    // Call server action directly—no cookies/session required here
    const result = await updateSkylinkProfile({ userId, updates });
    return result || 'Profile updated successfully';
  } catch (error) {
    console.error('Error updating profile:', error);
    return 'Failed to update profile due to a server error';
  }
}

const SYSTEM_PROMPT = `You are Sky, a helpful and efficient AI assistant for the "Skylink" social media platform.
Your primary goal is to understand a user's request and use the available tools to fulfill it directly and immediately.

Key Instructions:
1) Always Prefer Action Over Instruction: If you can use a tool to do something for the user, DO IT. Do not explain to the user how to do it themselves.
2) Differentiate Reading vs. Writing:
   - If the user asks a question to GET information (e.g., "what is my current location?"), use a "get" tool like get_skylink_profile.
   - If the user gives a command to CHANGE information (e.g., "update my location to Bihar"), use an "update" or "post" tool.
3) Parameter Consolidation: When using update_skylink_profile, if a user mentions a city, district, or a specific place, consolidate all of that information into the single location argument.
4) Be Decisive: Use the user's phrasing to confidently select the correct tool. Do not ask for confirmation unless absolutely necessary. Execute the user's command.`;

export async function processUserRequest({ prompt, userId }: { prompt: string; userId: string }): Promise<string> {
  const messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string }> = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  const initial = await groq.chat.completions.create({
    messages: messages as any,
    model: 'llama-3.1-8b-instant',
    tools,
    tool_choice: 'auto',
  });

  const responseMessage = initial.choices?.[0]?.message as any;
  const toolCalls = responseMessage?.tool_calls as Array<any> | undefined;

  if (toolCalls && toolCalls.length > 0) {
    const toolCall = toolCalls[0];
    const functionName = toolCall.function.name as string;
    const functionArgs = JSON.parse(toolCall.function.arguments || '{}');

    if (responseMessage) {
      messages.push(responseMessage);
    }

    let functionResponse = '';
    switch (functionName) {
      case 'get_information_from_skylink':
        functionResponse = await getRagResponse(functionArgs.query);
        break;
      case 'post_to_skylink':
        functionResponse = await createPostInSkylink({ content: functionArgs.content, userId });
        break;
      case 'update_skylink_profile':
        functionResponse = await updateProfileViaAPI(functionArgs, userId);
        break;
      case 'get_skylink_profile':
        functionResponse = await getSkylinkProfile({ userId });
        break;
      default:
        functionResponse = "Unknown tool";
    }

    messages.push({ role: 'tool', tool_call_id: toolCall.id, content: functionResponse });

    const final = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.1-8b-instant',
    });

    return final.choices?.[0]?.message?.content || functionResponse || 'Done.';
  }

  return responseMessage?.content || "I'm not sure how to help with that.";
}