export enum SentenceStatus {
  CORRECT = 'correct',
  INCORRECT = 'incorrect'
}

export interface SentenceWithStatus {
  sentence: string;
  status: SentenceStatus;
  review: string | null;
}

export interface RetellingReview {
  overall_review: string;
  sentences: SentenceWithStatus[];
}
