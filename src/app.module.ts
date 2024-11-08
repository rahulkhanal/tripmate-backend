import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/pg.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './src/auth/auth.module';
import { PropertyModule } from './src/property/property.module';
import { VisitModule } from './src/visit/visit.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    PropertyModule,
    VisitModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
