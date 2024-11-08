import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyEntity } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
import { FeatureEntity as Feature } from 'src/entities/feature.entity';
import { PropertyFeatureEntity as PropertyFeature } from 'src/entities/property_feature.entity';
import { CreateFeaturesDto } from './dto/feature.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(PropertyEntity)
    private readonly propertyRepository: Repository<PropertyEntity>,

    @InjectRepository(PropertyFeature)
    private readonly propertyFeatureRepository: Repository<PropertyFeature>,

    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,) { }

  async createFeatures(createFeaturesDto: CreateFeaturesDto): Promise<Feature[]> {
    const features = createFeaturesDto.features.map(feature => this.featureRepository.create(feature));
    return this.featureRepository.save(features);
  }

  async createProperty(createPropertyDto: CreatePropertyDto) {
    const { features, ...propertyData } = createPropertyDto;

    // Create and save the Property
    const property = this.propertyRepository.create(propertyData);
    await this.propertyRepository.save(property);

    // Create PropertyFeature relations
    for (const featureData of features) {
      const feature = await this.featureRepository.findOne({ where: { id: featureData.featureId } });
      if (!feature) throw new BadRequestException('Feature not found');
      const propertyFeature = this.propertyFeatureRepository.create({
        property,
        feature,
        status: featureData.status,
      });
      this.propertyFeatureRepository.save(propertyFeature);
    }
    return property;
  }

  async deleteProperty(id: number) {
    const result = await this.propertyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    } else {
      return { message: 'Property deleted successfully' };
    }
  }

  async findOne(id: number) {
    const property = await this.propertyRepository.findOne({ where: { id }, relations: ['propertyFeatures', 'propertyFeatures.feature'] });
    if (!property) return [];
    return property;

  }

  async findAll() {
    const properties = await this.propertyRepository.find({ relations: ['propertyFeatures', 'propertyFeatures.feature'] });
    if (!properties) return [];
    return properties;
  }
}
