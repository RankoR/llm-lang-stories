import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-story-text',
  imports: [CommonModule],
  templateUrl: './story-text.component.html',
  styleUrl: './story-text.component.scss',
  standalone: true
})
export class StoryTextComponent {
  @Input() text: string[] = [];
  @Input() showTranslationIcons = false;
  @Input() hideText = false;
  @Input() showItemIndices: number[] = [];

  @Output() showTranslation = new EventEmitter<number>();

  get allIndices(): number[] {
    return Array.from({length: this.text.length}, (_, i) => i);
  }

  isItemVisible(index: number): boolean {
    if (!this.hideText) {
      return true;
    }
    return this.showItemIndices.includes(index);
  }

  getDisplayText(item: string, index: number): string {
    if (this.isItemVisible(index)) {
      return item;
    }
    return '■'.repeat(item.length);
  }

  onTranslateClick(index: number): void {
    this.showTranslation.emit(index);
  }

  toggleTextVisibility(): void {
    if (this.showItemIndices.length === this.text.length) {
      // Hide all text
      this.showItemIndices = [];
    } else {
      // Show all text
      this.showItemIndices = this.allIndices;
    }
  }

  isAllTextVisible(): boolean {
    return this.showItemIndices.length === this.text.length;
  }
}
