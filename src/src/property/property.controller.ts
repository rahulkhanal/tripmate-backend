import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateFeaturesDto } from './dto/feature.dto';
import { FeatureEntity } from 'src/entities/feature.entity';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new property with features' })
  async registerProperty(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.createProperty(createPropertyDto);
  }

  @Post('features')
  @ApiOperation({ summary: 'Create a new feature' })
  async createFeature(@Body() createFeatureDto: CreateFeaturesDto): Promise<FeatureEntity[]> {
    return this.propertyService.createFeatures(createFeatureDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  remove(@Param('id') id: string) {
    return this.propertyService.deleteProperty(+id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  findAll() {
    return this.propertyService.findAll();
  }
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a property by ID' })
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(+id);
  }
}
