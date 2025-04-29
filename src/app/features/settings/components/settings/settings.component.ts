import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbCollapseModule, NgbDropdownModule, NgbPopoverModule} from '@ng-bootstrap/ng-bootstrap';
import {LanguageChooserComponent} from '../language-chooser/language-chooser.component';
import {SettingsService} from '../../services/settings.service';
import {Language} from '../../models/language.model';
import {llmModels} from '../../models/llm-model.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbDropdownModule, NgbCollapseModule, NgbPopoverModule, LanguageChooserComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  llmModels = llmModels;
  selectedModelId: string | null = null;
  learningLanguage: Language | null = null;
  nativeLanguage: Language | null = null;
  llmApiKey = '';
  hideApiKey = true;

  isCollapsed = true;
  textInput = '';
  @Output() textInputChange = new EventEmitter<string>();

  constructor(private settingsService: SettingsService) {
  }

  ngOnInit(): void {
    // Load saved settings
    this.selectedModelId = this.settingsService.selectedModelId;
    this.learningLanguage = this.settingsService.learningLanguage;
    this.nativeLanguage = this.settingsService.nativeLanguage;
    this.textInput = this.settingsService.textContent;
    this.llmApiKey = this.settingsService.llmApiKey;

    // Subscribe to changes
    this.settingsService.selectedModelId$.subscribe(modelId => {
      this.selectedModelId = modelId;
    });

    this.settingsService.learningLanguage$.subscribe(language => {
      this.learningLanguage = language;
    });

    this.settingsService.nativeLanguage$.subscribe(language => {
      this.nativeLanguage = language;
    });

    this.settingsService.textContent$.subscribe(text => {
      this.textInput = text;
    });

    this.settingsService.llmApiKey$.subscribe(apiKey => {
      this.llmApiKey = apiKey;
    });
  }

  onLlmApiKeyChange(apiKey: string): void {
    this.settingsService.setLlmApiKey(apiKey);
  }

  toggleApiKeyVisibility(): void {
    this.hideApiKey = !this.hideApiKey;
  }

  onModelSelect(modelId: string): void {
    this.settingsService.setSelectedModel(modelId);
  }

  onLearningLanguageSelect(language: Language | null): void {
    this.settingsService.setLearningLanguage(language);
  }

  onNativeLanguageSelect(language: Language | null): void {
    this.settingsService.setNativeLanguage(language);
  }

  clearModelSelection(): void {
    this.settingsService.setSelectedModel(null);
  }

  getSelectedModelName(): string {
    if (!this.selectedModelId) {
      return 'Select LLM Model';
    }
    const model = this.llmModels.find(m => m.id === this.selectedModelId);
    return model ? model.name : 'Select LLM Model';
  }

  onTextInputChange(text: string): void {
    this.settingsService.setTextContent(text);
    this.textInputChange.emit(text);
  }
}
