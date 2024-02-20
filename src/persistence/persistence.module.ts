import { Module } from '@nestjs/common';
import { ApisModule } from 'src/apis/apis.module';
import { ISearchRepositoryKey } from 'src/business/search/search.repository.interface';
import { SearchRepository } from './search/search.repository';

@Module({
  imports: [ApisModule],
  providers: [
    {
      provide: ISearchRepositoryKey,
      useClass: SearchRepository,
    },
  ],
  exports: [ISearchRepositoryKey],
})
export class PersistenceModule {}
