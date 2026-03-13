export type FilterOption = 'only' | 'exclude' | 'any';

export type SortOrder = 'asc' | 'desc';

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
