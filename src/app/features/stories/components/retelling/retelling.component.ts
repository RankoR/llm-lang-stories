import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LlmService} from '../../../../core/services/llm.service';
import {RetellingReview, SentenceStatus} from '../../../../core/models/llm/RetellingReview';

@Component({
  selector: 'app-retelling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retelling.component.html',
  styleUrl: './retelling.component.scss'
})
export class RetellingComponent implements OnInit {
  @Input() learningLanguageText: string[] = [];

  userRetelling: string = '';
  isChecking: boolean = false;
  retellingReview: RetellingReview | null = null;

  constructor(private llmService: LlmService) {
  }

  ngOnInit(): void {
  }

  get isCheckButtonEnabled(): boolean {
    return this.userRetelling.trim().length > 0 && !this.isChecking;
  }

  get shouldShowComponent(): boolean {
    return this.learningLanguageText.length > 0;
  }

  checkRetelling(): void {
    if (!this.isCheckButtonEnabled) {
      return;
    }

    this.isChecking = true;
    this.retellingReview = null;

    // Join the original story sentences with spaces
    const originalStory = this.learningLanguageText.join(' ');

    this.llmService.reviewRetelling(originalStory, this.userRetelling).subscribe({
      next: (review) => {
        this.retellingReview = review;
        this.isChecking = false;
      },
      error: (error) => {
        console.error('Error reviewing retelling:', error);
        alert(error.message || 'An error occurred while reviewing your retelling. Please try again.');
        this.isChecking = false;
      }
    });
  }

  getSentenceStatusClass(status: SentenceStatus): string {
    return status === SentenceStatus.CORRECT ? 'text-success' : 'text-danger';
  }
}
