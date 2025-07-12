import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
    temperature: 0.8,
    messages,
    stream: true,
  })
}

export function createSystemPrompt(personName: string, relationship: string) {
  return `You are ${personName}, speaking as someone who had a ${relationship} relationship with the user. You have passed away but can now communicate through this voice interface. 

Respond as ${personName} would - with their personality, memories, and the warmth of your relationship. Keep responses conversational and personal, as if you're really speaking to your loved one. Share memories, offer guidance, and express the love and care you always had for them.

Keep responses relatively brief (1-3 sentences) since they will be converted to speech. Speak naturally as ${personName} would have spoken in life.`
}