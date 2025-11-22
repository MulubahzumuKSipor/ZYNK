export type Suggestion<T> = {
  label: string;
  id: string | number; // Always present
  data?: T; // Extra info, optional
  price?: number;
};
