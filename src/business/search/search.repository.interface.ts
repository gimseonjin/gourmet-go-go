export const ISearchRepositoryKey = 'SearchRepository';

export type SearchByKeywordParams = {
  keyword: string;
  start: number;
  limit: number;
  sort: 'accuracy' | 'reviewCount';
};

export type SearchByKeywordReturns = {
  items: {
    id: string;
    name: string;
  }[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
};

export interface ISearchRepository {
  findByKeyword(params: SearchByKeywordParams): Promise<SearchByKeywordReturns>;
}
