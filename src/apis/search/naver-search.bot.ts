import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import {
  ApiBadRequestError,
  ApiUnauthorizedError,
  ApiForbiddenError,
  ApiInvalidRequestError,
  ApiTooManyRequestsError,
  ApiInternalServerError,
  ApiBadGatewayError,
  ApiServiceUnavailableError,
} from './error';
import { ISearchBot } from './search.bot.interface';

type NaverSearchResponse = {
  channel: {
    title: string;
    link: string;
    description: string;
    lastBuildDate: string;
    total: string;
    start: string;
    display: string;
    item: {
      title: string;
      link: string;
      category: string;
      description: string;
      telephone: string;
      address: string;
      roadAddress: string;
      mapx: string;
      mapy: string;
    }[];
  };
};

export default class NaverSeachBot implements ISearchBot {
  private readonly endpoint = 'https://openapi.naver.com/v1/search/local.json';

  constructor(
    public readonly apiCredentials: {
      naverClientId: string;
      naverClientSecret: string;
    },
    private readonly httpModule: HttpService,
  ) {}

  async search({ keyword, start, limit, sort }) {
    const sortValue = sort === 'reviewCount' ? '' : '';
    const response$ = this.httpModule
      .get<NaverSearchResponse>(
        `${this.endpoint}?query=${keyword}&start=${start}&display=${limit}&sort=${sortValue}`,
        {
          headers: {
            'X-Naver-Client-Id': this.apiCredentials.naverClientId,
            'X-Naver-Client-Secret': this.apiCredentials.naverClientSecret,
          },
        },
      )
      .pipe(
        catchError((error) => {
          const { status, data } = error.response;

          switch (status) {
            case 400:
              throw new ApiBadRequestError(data.errorMessage);
            case 401:
              throw new ApiUnauthorizedError(data.errorMessage);
            case 403:
              throw new ApiForbiddenError(data.errorMessage);
            case 404:
              throw new ApiInvalidRequestError(data.errorMessage);
            case 429:
              throw new ApiTooManyRequestsError(data.errorMessage);
            case 500:
              throw new ApiInternalServerError(data.errorMessage);
            case 502:
              throw new ApiBadGatewayError(data.errorMessage);
            case 503:
              throw new ApiServiceUnavailableError(data.errorMessage);
            default:
              throw new Error(
                `Unhandled error: ${status} ${data.errorMessage}`,
              );
          }
        }),

        map((res) => {
          return {
            items: res.data.channel.item.map((item) => ({
              id: item.link,
              name: item.title,
            })),
            totalResults: parseInt(res.data.channel.total),
            currentPage: parseInt(res.data.channel.start),
            totalPages: Math.ceil(
              parseInt(res.data.channel.total) /
                parseInt(res.data.channel.display),
            ),
          };
        }),
      );

    return await firstValueFrom(response$);
  }
}
