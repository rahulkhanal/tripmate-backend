import { Injectable } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyEntity } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
import { PropertyFeatureEntity } from 'src/entities/property_feature.entity';
import { FeatureEntity } from 'src/entities/feature.entity';
import { RatingEntity } from 'src/entities/rating.entity';
import { VisitEntity } from 'src/entities/visit.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';

@Injectable()
export class VisitService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,

    @InjectRepository(PropertyFeatureEntity)
    private readonly propertyFeatureRepository: Repository<PropertyFeatureEntity>,

    @InjectRepository(FeatureEntity)
    private readonly featureRepository: Repository<FeatureEntity>,

    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,

    @InjectRepository(VisitEntity)
    private readonly visitRepository: Repository<VisitEntity>,

    @InjectRepository(VisitorEntity)
    private readonly visitorRepository: Repository<VisitorEntity>,
  ) { }

  
}
