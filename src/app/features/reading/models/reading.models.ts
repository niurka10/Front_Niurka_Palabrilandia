export interface ReadingQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface ReadingText {
  id: number;
  title: string;
  content: string;
  questions: ReadingQuestion[];
}