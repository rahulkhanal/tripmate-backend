import { Module } from '@nestjs/common';
import { VisitService } from './visit.service';
import { VisitController } from './visit.controller';
import { VisitEntity } from 'src/entities/visit.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { RatingEntity } from 'src/entities/rating.entity';
import { FeatureEntity } from 'src/entities/feature.entity';
import { PropertyEntity } from 'src/entities/property.entity';
import { PropertyFeatureEntity } from 'src/entities/property_feature.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([VisitEntity, VisitorEntity, RatingEntity, FeatureEntity, PropertyEntity, PropertyFeatureEntity])],
  controllers: [VisitController],
  providers: [VisitService],
})
export class VisitModule {}
