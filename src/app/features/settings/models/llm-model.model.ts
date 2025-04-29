export interface LLMModel {
  id: string;
  name: string;
}

export const llmModels: LLMModel[] = [
  {
    id: 'gemini-2.5-flash-preview-04-17',
    name: 'Gemini 2.5 Flash',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
  },
  {
    id: 'gemini-2.5-pro-preview-03-25',
    name: 'Gemini 2.5 Pro',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
  },
]
