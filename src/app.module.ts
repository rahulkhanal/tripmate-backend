import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/pg.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './src/auth/auth.module';
import { PropertyModule } from './src/property/property.module';
import { VisitModule } from './src/visit/visit.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './middleware/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from './middleware/at.strategy';


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
