import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdateFeatureStatusDto, UpdatePropertyDto } from './dto/update-property.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateFeaturesDto } from './dto/feature.dto';
import { FeatureEntity } from 'src/entities/feature.entity';
import { Roles } from 'src/middleware/roles.decorator';
import { RolesGuard } from 'src/middleware/roles.guard';
import { AtGuard } from 'src/middleware/at.guard';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new property with features' })
  async registerProperty(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.createProperty(createPropertyDto);
  }

  @Roles('super_admin')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Create a new feature' })
  async createFeature(@Body() createFeatureDto: CreateFeaturesDto): Promise<FeatureEntity[]> {
    return this.propertyService.createFeatures(createFeatureDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
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
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update all details of a property, excluding amenities' })
  @ApiParam({ name: 'id', description: 'The ID of the property to update' })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiBearerAuth('access_token')
  @UseGuards(AtGuard, RolesGuard)
  @Roles('super_admin')
  async updateProperty(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }

  @Patch(':id/features')
  @ApiOperation({ summary: 'Update the status of a feature for a property' })
  @ApiParam({ name: 'id', description: 'The ID of the property to update' })
  @ApiBody({ type: UpdateFeatureStatusDto })
  @Roles('super_admin')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  async updateFeatureStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeatureStatusDto: UpdateFeatureStatusDto,
  ) {
    return this.propertyService.updateFeatureStatus(id, updateFeatureStatusDto);
  }
}