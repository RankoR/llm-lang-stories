import { Component, OnDestroy, OnInit } from '@angular/core';
import {SettingsComponent} from '../../../settings/components/settings/settings.component';
import {StoryTextComponent} from '../../../stories/components/story-text/story-text.component';
import {LlmService} from '../../../../core/services/llm.service';
import {SettingsService} from '../../../../features/settings/services/settings.service';
import {Subscription, combineLatest} from 'rxjs';
import {RetellingComponent} from '../../../stories/components/retelling/retelling.component';

@Component({
  selector: 'app-index',
  imports: [
    SettingsComponent,
    StoryTextComponent,
    RetellingComponent
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent implements OnInit, OnDestroy {
  textFromSettings: string = '';

  learningLanguageText: string[] = [];
  nativeLanguageText: string[] = [];

  translationIndices: number[] = [];

  isGenerating = false;
  areSettingsValid = false;

  private subscriptions = new Subscription();

  constructor(
    private llmService: LlmService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    // Check if all settings are valid
    this.subscriptions.add(
      combineLatest([
        this.settingsService.learningLanguage$,
        this.settingsService.nativeLanguage$,
        this.settingsService.llmApiKey$,
        this.settingsService.selectedModelId$,
        this.settingsService.textContent$
      ]).subscribe(([learningLanguage, nativeLanguage, llmApiKey, selectedModelId, textContent]) => {
        this.areSettingsValid = !!(learningLanguage && nativeLanguage && llmApiKey && selectedModelId && textContent);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onTextInputChange(text: string): void {
    this.textFromSettings = text;
    console.log('Text from settings:', text);
  }

  onShowTranslation(index: number): void {
    // If the index is already in the array, remove it (toggle off)
    if (this.translationIndices.includes(index)) {
      this.translationIndices = [];
    } else {
      // Otherwise, set the array to contain only this index
      this.translationIndices = [index];
    }
  }

  generateStory(): void {
    if (!this.areSettingsValid) {
      alert('Please fill in all required settings before generating a story.');
      return;
    }

    this.isGenerating = true;

    this.subscriptions.add(
      this.llmService.generateStory().subscribe({
        next: (story) => {
          this.learningLanguageText = story.learning_language_text;
          this.nativeLanguageText = story.native_language_text;
          this.isGenerating = false;
        },
        error: (error) => {
          alert(error.message || 'An error occurred while generating the story. Please try again.');
          this.isGenerating = false;
        }
      })
    );
  }
}
