import { Suggestion } from "./suggestion";

export type SearchBarProps<T = unknown> = {
  placeholder?: string;
  minChars?: number;
  debounceMs?: number;
  onSearch?: (query: string) => void;
  onSelect?: (_id: string | number) => void;
  fetchSuggestions?: (query: string) => Promise<Suggestion<T>[]>;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
};
