import { CircuitBreaker } from '../circuit.breaker';
import SearchApi from './search.api';
import {
  ISearchBot,
  SearchParams,
  SearchResults,
} from './search.bot.interface';

class MockSearchBotSuccess implements ISearchBot {
  async search(params: SearchParams): Promise<SearchResults> {
    return {
      items: [{ id: 'kim', name: 'name' }],
      totalResults: 1,
      currentPage: 10,
      totalPages: 10,
    };
  }
}

class MockSearchBotFail implements ISearchBot {
  async search(params: SearchParams): Promise<SearchResults> {
    throw new Error('Search failed');
  }
}

describe('SearchApi', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('성공적인 검색 시 첫 번째 결과 반환', async () => {
    const bots = [new MockSearchBotSuccess(), new MockSearchBotFail()];
    const api = new SearchApi(
      bots.map(
        (bot) =>
          new CircuitBreaker<SearchParams, SearchResults>(
            bot.search.bind(bot),
            bot.constructor.name,
          ),
      ),
    );
    const params: SearchParams = {
      keyword: 'test',
      start: 1,
      limit: 10,
      sort: 'accuracy',
    };

    const result = await api.search(params);

    expect(result).toEqual({
      items: [{ id: 'kim', name: 'name' }],
      totalResults: 1,
      currentPage: 10,
      totalPages: 10,
    });
  });

  it('첫 번째 검색 봇 실패 후 두 번째 검색 봇 호출 및 성공', async () => {
    const bots = [new MockSearchBotFail(), new MockSearchBotSuccess()];
    const api = new SearchApi(
      bots.map(
        (bot) =>
          new CircuitBreaker<SearchParams, SearchResults>(
            bot.search.bind(bot),
            bot.constructor.name,
          ),
      ),
    );
    const params: SearchParams = {
      keyword: 'test',
      start: 1,
      limit: 10,
      sort: 'accuracy',
    };

    const result = await api.search(params);

    expect(result).toEqual({
      items: [{ id: 'kim', name: 'name' }],
      totalResults: 1,
      currentPage: 10,
      totalPages: 10,
    });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Search failed with Bot MockSearchBotFail'),
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        'Search successful with Bot MockSearchBotSuccess',
      ),
    );
  });

  it('모든 검색 봇 실패 시 에러 발생', async () => {
    const bots = [new MockSearchBotFail(), new MockSearchBotFail()];
    const api = new SearchApi(
      bots.map(
        (bot) =>
          new CircuitBreaker<SearchParams, SearchResults>(
            bot.search.bind(bot),
            bot.constructor.name,
          ),
      ),
    );
    const params: SearchParams = {
      keyword: 'test',
      start: 1,
      limit: 10,
      sort: 'accuracy',
    };

    await expect(api.search(params)).rejects.toThrow('All search bots failed');
  });
});
