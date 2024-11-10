import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdateFeatureStatusDto, UpdatePropertyDto } from './dto/update-property.dto';
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

  async createProperty(createPropertyDto) {
    const { features, imgDocUrl, imgUrl, ...propertyData } = createPropertyDto;
    const arrayData = JSON.parse(features);
    const property = this.propertyRepository.create({
      name: propertyData.name,
      category: propertyData.category,
      location: propertyData.location,
      description: propertyData.description,
      price: propertyData.price,
      imgUrl:  String(imgUrl),
      imgDocUrl: String(imgDocUrl),
    });
    await this.propertyRepository.save(property);

    for (const featureData of arrayData) {
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
    const properties = await this.propertyRepository.find({ relations: ['propertyFeatures', 'propertyFeatures.feature', 'ratings'] });
    if (!properties) return [];
    let propertyrate = 0;
    const resp = properties.map(property => {
      property.ratings.map(rating => {
        propertyrate += rating.rating_score;
        return rating;
      });
      return { ...property, ratings: propertyrate / property.ratings.length };
    });
    return resp;
  }

  async updateProperty(id: number, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) throw new NotFoundException(`Property with ID ${id} not found`);
    const updatedProperty = Object.assign(property, updatePropertyDto);
    return await this.propertyRepository.save(updatedProperty);
  }

  async updateFeatureStatus(id: number, updateFeatureStatusDto: UpdateFeatureStatusDto) {
    const propertyFeature = await this.propertyFeatureRepository.findOne({ where: { id: id } });
    if (!propertyFeature) throw new NotFoundException(`PropertyFeature with ID ${id} not found`);

    propertyFeature.status = updateFeatureStatusDto.status;
    return await this.propertyFeatureRepository.save(propertyFeature);
  }
}
