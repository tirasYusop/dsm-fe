// lib/pagination.ts
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function getResults<T>(data: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data.results;
}

export interface PageMeta {
  count: number;
  page_size: number;
  next: string | null;
  previous: string | null;
}

export function getPageMeta<T>(data: PaginatedResponse<T> | T[], fallbackPageSize = 10): PageMeta {
  if (Array.isArray(data)) {
    return { count: data.length, page_size: fallbackPageSize, next: null, previous: null };
  }
  const raw = data as PaginatedResponse<T> & { page_size?: number };
  return {
    count: raw.count,
    page_size: raw.page_size ?? fallbackPageSize,
    next: raw.next,
    previous: raw.previous,
  };
}