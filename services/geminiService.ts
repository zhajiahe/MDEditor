import { GoogleGenAI } from "@google/genai";
import { AIRequestOptions, AISettings } from '../types';

// Default Gemini Instance
const geminiAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const generateAIContent = async (options: AIRequestOptions, settings: AISettings): Promise<string> => {
  let systemInstruction = "You are a helpful AI writing assistant for a Markdown editor. Output strictly in Markdown format.";
  let prompt = "";
  
  switch (options.type) {
    case 'improve':
      prompt = `Improve the following Markdown text for clarity, grammar, and flow. Preserve the original meaning and Markdown formatting. Return only the improved text.\n\nText:\n${options.context}`;
      break;
    case 'fix_grammar':
      prompt = `Fix spelling and grammar errors in the following text. Do not change the style. Return only the corrected text.\n\nText:\n${options.context}`;
      break;
    case 'tone_professional':
      prompt = `Rewrite the following text to sound more professional and formal. Return only the rewritten text.\n\nText:\n${options.context}`;
      break;
    case 'tone_friendly':
      prompt = `Rewrite the following text to sound more friendly and approachable. Return only the rewritten text.\n\nText:\n${options.context}`;
      break;
    case 'summarize':
      prompt = `Summarize the following text into a concise paragraph using Markdown. Return only the summary.\n\nText:\n${options.context}`;
      break;
    case 'continue':
      prompt = `Continue writing the following Markdown text creatively. Maintain the style and tone. Return only the continuation.\n\nText:\n${options.context}`;
      break;
    case 'translate':
      prompt = `Translate the following text to English (or optimize the English if it is already English). Return only the translated text in Markdown.\n\nText:\n${options.context}`;
      break;
    case 'custom':
      prompt = `${options.prompt}\n\nContext:\n${options.context || ''}`;
      break;
    default:
      prompt = options.prompt;
  }

  // 1. OpenAI Compatible Custom Provider
  if (settings.provider === 'openai' && settings.apiKey && settings.baseUrl) {
    try {
      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Failed to fetch from OpenAI compatible API');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI Compatible API Error:", error);
      throw error;
    }
  }

  // 2. Default Gemini Provider
  try {
    const response = await geminiAi.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};