import { Module } from '@nestjs/common';
import { BusinessModule } from './business/business.module';
import { PresentationModule } from './presentation/presentation.module';
import { PersistenceModule } from './persistence/persistence.module';
import { DatabaseModule } from './database/database.module';
import { ApisModule } from './apis/apis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BusinessModule,
    PresentationModule,
    PersistenceModule,
    DatabaseModule,
    ApisModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
