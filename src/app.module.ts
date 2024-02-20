import { Module } from '@nestjs/common';
import { BusinessModule } from './business/business.module';
import { PresentationModule } from './presentation/presentation.module';
import { PersistenceModule } from './persistence/persistence.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [BusinessModule, PresentationModule, PersistenceModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
