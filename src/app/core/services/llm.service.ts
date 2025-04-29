import {Injectable} from '@angular/core';
import {SettingsService} from '../../features/settings/services/settings.service';
import {LlmStory} from '../models/llm/LlmStory';
import {Observable, throwError} from 'rxjs';
import {GENERATE_STORY_SYSTEM_PROMPT, REVIEW_RETELLING_SYSTEM_PROMPT} from '../models/llm/llm-prompts';
import {GoogleGenAI, Type} from "@google/genai";
import {getLogger} from '../utils/log-utils';
import {RetellingReview} from '../models/llm/RetellingReview';

@Injectable({
  providedIn: 'root'
})
export class LlmService {

  private logger = getLogger('LlmService');

  constructor(
    private settingsService: SettingsService,
  ) {
  }

  generateContent<T>(systemPrompt: string, userPrompt: string, schema: any): Observable<T> {
    const llmApiKey = this.settingsService.llmApiKey;
    const llmModel = this.settingsService.selectedModelId;

    if (!llmApiKey || !llmModel) {
      this.logger.error('generateContent: API key or model not set');
      return throwError(() => new Error('API key and model must be set. Please check your settings.'));
    }

    return new Observable<T>(observer => {
      const ai = new GoogleGenAI({apiKey: llmApiKey});

      (async () => {
        try {
          const response = await ai.models.generateContent({
            model: llmModel,
            contents: [
              {role: 'user', parts: [{text: userPrompt}]}
            ],
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: schema,
              temperature: 0.8,
            },
          });

          const text = response.text;
          if (!text) {
            throw new Error('Invalid response format from LLM: no text');
          }

          try {
            const content: T = JSON.parse(text);

            observer.next(content);
            observer.complete();
          } catch (parseError) {
            this.logger.error('Failed to parse LLM response', parseError);
            observer.error(new Error('Failed to parse the generated content. Please try again.'));
          }
        } catch (error) {
          this.logger.error('Error generating content', error);
          observer.error(error instanceof Error ? error : new Error('Failed to generate content. Please try again.'));
        }
      })();

      return () => {
        // Cleanup if needed
      };
    });
  }

  generateStory(): Observable<LlmStory> {
    const learningLanguage = this.settingsService.learningLanguage;
    const nativeLanguage = this.settingsService.nativeLanguage;
    const userPrompt = this.settingsService.textContent;

    if (!learningLanguage || !nativeLanguage || !userPrompt) {
      this.logger.error('generateStory: Not all parameters set');
      return throwError(() => new Error('Not all parameters are set. Please fill in all required fields.'));
    }

    const systemPrompt = GENERATE_STORY_SYSTEM_PROMPT
      .replace('{learning_language}', learningLanguage?.name_en!)
      .replace('{native_language}', nativeLanguage?.name_en!);

    const schema = {
      type: Type.OBJECT,
      properties: {
        'learning_language_text': {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: `Text in ${learningLanguage?.name_en}`,
          },
          description: `Array of sentences in ${learningLanguage?.name_en}`,
          nullable: false,
        },
        'native_language_text': {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: `Text in ${nativeLanguage?.name_en}`,
          },
          description: `Array of sentences in ${nativeLanguage?.name_en}`,
          nullable: false,
        },
      },
      required: ['learning_language_text', 'native_language_text'],
    };

    return this.generateContent<LlmStory>(systemPrompt, userPrompt, schema);
  }

  reviewRetelling(originalStory: string, retelling: string): Observable<RetellingReview> {
    const learningLanguage = this.settingsService.learningLanguage;
    const nativeLanguage = this.settingsService.nativeLanguage;

    if (!learningLanguage || !nativeLanguage || !originalStory || !retelling) {
      this.logger.error('reviewRetelling: Not all parameters set');
      return throwError(() => new Error('Not all parameters are set. Please fill in all required fields.'));
    }

    const systemPrompt = REVIEW_RETELLING_SYSTEM_PROMPT
      .replace('{learning_language}', learningLanguage?.name_en!)
      .replace('{native_language}', nativeLanguage?.name_en!);

    const userPrompt = `Original story in ${learningLanguage?.name_en}:\n${originalStory}\n\nUser's retelling in ${learningLanguage?.name_en}:\n${retelling}`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        'overall_review': {
          type: Type.STRING,
          description: `Overall review of the retelling in ${nativeLanguage?.name_en}`,
          nullable: false,
        },
        'sentences': {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              'sentence': {
                type: Type.STRING,
                description: 'The original sentence from the user\'s retelling',
                nullable: false,
              },
              'status': {
                type: Type.STRING,
                description: 'Status of the sentence: "correct" or "incorrect"',
                enum: ['correct', 'incorrect'],
                nullable: false,
              },
              'review': {
                type: Type.STRING,
                description: `Review of the sentence in ${nativeLanguage?.name_en} with corrections in ${learningLanguage?.name_en}`,
                nullable: true,
              },
            },
            required: ['sentence', 'status', 'review'],
          },
          description: 'Array of sentences with their review status',
          nullable: false,
        },
      },
      required: ['overall_review', 'sentences'],
    };

    return this.generateContent<RetellingReview>(systemPrompt, userPrompt, schema);
  }
}
