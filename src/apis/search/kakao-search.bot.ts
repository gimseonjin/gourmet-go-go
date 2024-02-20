import { HttpService } from '@nestjs/axios';
import { catchError, map, firstValueFrom } from 'rxjs';
import {
  ApiBadRequestError,
  ApiUnauthorizedError,
  ApiForbiddenError,
  ApiTooManyRequestsError,
  ApiInternalServerError,
  ApiBadGatewayError,
  ApiServiceUnavailableError,
} from './error';
import { ISearchBot } from './search.bot.interface';

type KakaoSearchResponse = {
  meta: {
    same_name: {
      region: string[];
      keyword: string;
      selected_region: string;
    };
    pageable_count: number;
    total_count: number;
    is_end: boolean;
  };
  documents: {
    place_name: string;
    distance: string;
    place_url: string;
    category_name: string;
    address_name: string;
    road_address_name: string;
    id: string;
    phone: string;
    category_group_code: string;
    category_group_name: string;
    x: string;
    y: string;
  }[];
};

export default class KakaoSeachBot implements ISearchBot {
  private readonly endpoint =
    'https://dapi.kakao.com/v2/local/search/keyword.json';
  private readonly categoryGroupCode = 'FD6';

  constructor(
    public readonly apiCredentials: {
      kakaoRestApiKey: string;
    },
    private readonly httpModule: HttpService,
  ) {}

  async search({ keyword, start, limit, sort }) {
    const response$ = this.httpModule
      .get<KakaoSearchResponse>(
        `${this.endpoint}?query=${keyword}&category_group_code=${this.categoryGroupCode}&page=${start}&size=${limit}`,
        {
          headers: {
            Authorization: `KakaoAK ${this.apiCredentials.kakaoRestApiKey}`,
          },
        },
      )
      .pipe(
        catchError((e) => {
          switch (e.response?.status) {
            case 400:
              throw new ApiBadRequestError(
                `Bad Request: ${e.response?.data.message}`,
              );
            case 401:
              throw new ApiUnauthorizedError(
                `Unauthorized: ${e.response?.data.message}`,
              );
            case 403:
              throw new ApiForbiddenError(
                `Forbidden: ${e.response?.data.message}`,
              );
            case 429:
              throw new ApiTooManyRequestsError(
                `Too Many Requests: ${e.response?.data.message}`,
              );
            case 500:
              throw new ApiInternalServerError(
                `Internal Server Error: ${e.response?.data.message}`,
              );
            case 502:
              throw new ApiBadGatewayError(
                `Bad Gateway: ${e.response?.data.message}`,
              );
            case 503:
              throw new ApiServiceUnavailableError(
                `Service Unavailable: ${e.response?.data.message}`,
              );
            default:
              throw new Error(`Unhandled error: ${e.response?.data.message}`);
          }
        }),

        map((res) => {
          return {
            items: res.data.documents.map((doc) => ({
              id: doc.id,
              name: doc.place_name,
            })),
            totalResults: res.data.meta.total_count,
            currentPage: res.data.meta.pageable_count,
            totalPages: Math.ceil(res.data.meta.total_count / 10),
          };
        }),
      );

    return await firstValueFrom(response$);
  }
}
