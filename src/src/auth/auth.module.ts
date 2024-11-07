import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperAdmin } from 'src/entities/super_admin.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperAdmin, VisitorEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],

})
export class AuthModule { }
