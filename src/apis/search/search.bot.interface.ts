export type SearchParams = {
  keyword: string;
  start: number;
  limit: number;
  sort: 'accuracy' | 'reviewCount';
};

export type SearchResults = {
  items: Array<{
    id: string;
    name: string;
  }>;
  totalResults: number;
  currentPage: number;
  totalPages: number;
};

export interface ISearchBot {
  search(params: SearchParams): Promise<SearchResults>;
}
