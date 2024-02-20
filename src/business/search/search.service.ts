import { Inject, Injectable } from '@nestjs/common';
import {
  ISearchRepository,
  ISearchRepositoryKey,
} from './search.repository.interface';

export type SearchServiceParams = {
  keyword: string;
  start: number;
  limit: number;
  sort: 'accuracy' | 'reviewCount';
};

export type SearchServiceReturns = {
  items: {
    id: string;
    name: string;
  }[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
};

@Injectable()
export class SearchService {
  constructor(
    @Inject(ISearchRepositoryKey)
    private readonly searchRepo: ISearchRepository,
  ) {}

  async search(params: SearchServiceParams): Promise<SearchServiceReturns> {
    const { keyword, start = 1, limit = 10, sort = 'accuracy' } = params;
    return this.searchRepo.findByKeyword({
      keyword,
      start,
      limit,
      sort,
    });
  }
}
