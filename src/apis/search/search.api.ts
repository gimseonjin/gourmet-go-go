import { CircuitBreaker } from '../circuit.breaker';
import {
  ISearchBot,
  SearchParams,
  SearchResults,
} from './search.bot.interface';

export default class SearchApi {
  constructor(
    private readonly circuitBreakers: CircuitBreaker<
      SearchParams,
      SearchResults
    >[],
  ) {}

  async search({ keyword, start, limit, sort }) {
    for (const cb of this.circuitBreakers) {
      try {
        const result = await cb.fire({
          keyword,
          start,
          limit,
          sort,
        });
        console.log(
          `Search successful with Bot ${cb.instanceName}: ${JSON.stringify(result)}`,
        );
        return result;
      } catch (error) {
        console.error(
          `Search failed with Bot ${cb.instanceName}: ${error.message}`,
        );
      }
    }

    throw new Error('All search bots failed');
  }
}
