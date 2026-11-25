export interface SpellingExercise {
  id: number;
  sentence: string;
  options: string[];
}

export interface CheckAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
}