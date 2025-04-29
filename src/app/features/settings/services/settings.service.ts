import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Language} from '../models/language.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly LLM_MODEL_KEY = 'llm_model_id';
  private readonly LEARNING_LANGUAGE_KEY = 'learning_language_code';
  private readonly NATIVE_LANGUAGE_KEY = 'native_language_code';
  private readonly TEXT_CONTENT_KEY = 'text_content';
  private readonly LLM_API_KEY = 'llm_api_key';

  private _selectedModelId = new BehaviorSubject<string | null>(null);
  private _learningLanguage = new BehaviorSubject<Language | null>(null);
  private _nativeLanguage = new BehaviorSubject<Language | null>(null);
  private _textContent = new BehaviorSubject<string>('A short story for a 5 year old child');
  private _llmApiKey = new BehaviorSubject<string>('');

  constructor() {
    this.loadFromStorage();
  }

  // LLM Model
  get selectedModelId$(): Observable<string | null> {
    return this._selectedModelId.asObservable();
  }

  get selectedModelId(): string | null {
    return this._selectedModelId.value;
  }

  setSelectedModel(modelId: string | null): void {
    this._selectedModelId.next(modelId);
    if (modelId) {
      localStorage.setItem(this.LLM_MODEL_KEY, modelId);
    } else {
      localStorage.removeItem(this.LLM_MODEL_KEY);
    }
  }

  // Learning Language
  get learningLanguage$(): Observable<Language | null> {
    return this._learningLanguage.asObservable();
  }

  get learningLanguage(): Language | null {
    return this._learningLanguage.value;
  }

  setLearningLanguage(language: Language | null): void {
    this._learningLanguage.next(language);
    if (language) {
      localStorage.setItem(this.LEARNING_LANGUAGE_KEY, language.code);
    } else {
      localStorage.removeItem(this.LEARNING_LANGUAGE_KEY);
    }
  }

  // Native Language
  get nativeLanguage$(): Observable<Language | null> {
    return this._nativeLanguage.asObservable();
  }

  get nativeLanguage(): Language | null {
    return this._nativeLanguage.value;
  }

  setNativeLanguage(language: Language | null): void {
    this._nativeLanguage.next(language);
    if (language) {
      localStorage.setItem(this.NATIVE_LANGUAGE_KEY, language.code);
    } else {
      localStorage.removeItem(this.NATIVE_LANGUAGE_KEY);
    }
  }

  // Text Content
  get textContent$(): Observable<string> {
    return this._textContent.asObservable();
  }

  get textContent(): string {
    return this._textContent.value;
  }

  setTextContent(text: string): void {
    this._textContent.next(text);
    localStorage.setItem(this.TEXT_CONTENT_KEY, text);
  }

  // LLM API Key
  get llmApiKey$(): Observable<string> {
    return this._llmApiKey.asObservable();
  }

  get llmApiKey(): string {
    return this._llmApiKey.value;
  }

  setLlmApiKey(apiKey: string): void {
    this._llmApiKey.next(apiKey);
    localStorage.setItem(this.LLM_API_KEY, apiKey);
  }

  // Load saved settings from storage
  private loadFromStorage(): void {
    // Load LLM Model
    const savedModelId = localStorage.getItem(this.LLM_MODEL_KEY);
    if (savedModelId) {
      this._selectedModelId.next(savedModelId);
    }

    // Load Learning Language
    const learningLanguageCode = localStorage.getItem(this.LEARNING_LANGUAGE_KEY);
    if (learningLanguageCode) {
      this.loadLanguageByCode(learningLanguageCode, this._learningLanguage);
    }

    // Load Native Language
    const nativeLanguageCode = localStorage.getItem(this.NATIVE_LANGUAGE_KEY);
    if (nativeLanguageCode) {
      this.loadLanguageByCode(nativeLanguageCode, this._nativeLanguage);
    }

    // Load Text Content
    const savedText = localStorage.getItem(this.TEXT_CONTENT_KEY);
    if (savedText) {
      this._textContent.next(savedText);
    } else {
      // If no text is saved, use the default "Example text" and save it
      localStorage.setItem(this.TEXT_CONTENT_KEY, this._textContent.value);
    }

    // Load LLM API Key
    const savedApiKey = localStorage.getItem(this.LLM_API_KEY);
    if (savedApiKey) {
      this._llmApiKey.next(savedApiKey);
    }
  }

  private loadLanguageByCode(code: string, subject: BehaviorSubject<Language | null>): void {
    import('../models/language.model').then(({languages}) => {
      const language = languages.find(lang => lang.code === code);
      if (language) {
        subject.next(language);
      }
    });
  }
}
