import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from 'src/entities/property.entity';
import { FeatureEntity } from 'src/entities/feature.entity';
import { PropertyFeatureEntity } from 'src/entities/property_feature.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyEntity, FeatureEntity, PropertyFeatureEntity])],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule { }