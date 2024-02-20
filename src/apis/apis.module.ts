import { Module } from '@nestjs/common';
import SearchApi from './search/search.api';
import {
  ISearchBot,
  SearchParams,
  SearchResults,
} from './search/search.bot.interface';
import { CircuitBreaker } from './circuit.breaker';
import { ConfigService } from '@nestjs/config';
import NaverSeachBot from './search/naver-search.bot';
import KakaoSeachBot from './search/kakao-search.bot';
import { HttpModule, HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: SearchApi,
      useFactory: (config: ConfigService, httpSvc: HttpService) => {
        const { naverClientId, naverClientSecret, kakaoRestApiKey } =
          config.get('api.credentials');
          
        const bots: ISearchBot[] = [
          new NaverSeachBot({ naverClientId, naverClientSecret }, httpSvc),
          new KakaoSeachBot({ kakaoRestApiKey }, httpSvc),
        ];

        return new SearchApi(
          bots.map(
            (bot) =>
              new CircuitBreaker<SearchParams, SearchResults>(
                bot.search.bind(bot),
                bot.constructor.name,
              ),
          ),
        );
      },
      inject: [ConfigService, HttpService],
    },
  ],
})
export class ApisModule {}
