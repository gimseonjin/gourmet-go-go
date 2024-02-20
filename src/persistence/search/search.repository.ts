import { Injectable } from '@nestjs/common';
import SearchApi from 'src/apis/search/search.api';
import {
  ISearchRepository,
  SearchByKeywordParams,
  SearchByKeywordReturns,
} from 'src/business/search/search.repository.interface';

@Injectable()
export class SearchRepository implements ISearchRepository {
  constructor(private readonly searchApi: SearchApi) {}

  async findByKeyword(
    params: SearchByKeywordParams,
  ): Promise<SearchByKeywordReturns> {
    const { keyword, start, limit, sort } = params;
    return await this.searchApi.search({ keyword, start, limit, sort });
  }
}
