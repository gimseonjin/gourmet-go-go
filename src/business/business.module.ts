import { Module } from '@nestjs/common';
import { PersistenceModule } from 'src/persistence/persistence.module';
import { SearchService } from './search/search.service';

@Module({
  imports: [PersistenceModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class BusinessModule {}
