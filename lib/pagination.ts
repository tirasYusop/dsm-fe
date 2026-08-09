export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}


export function getResults<T>(
  data: PaginatedResponse<T> | T[]
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results;
}