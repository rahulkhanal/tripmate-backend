import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdateFeatureStatusDto, UpdatePropertyDto } from './dto/update-property.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CreateFeaturesDto } from './dto/feature.dto';
import { FeatureEntity } from 'src/entities/feature.entity';
import { Roles } from 'src/middleware/roles.decorator';
import { RolesGuard } from 'src/middleware/roles.guard';
import { AtGuard } from 'src/middleware/at.guard';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

const storage = diskStorage({
  destination: './uploads', 
  filename: (req, file, callback) => {
    const uniqueSuffix = uuidv4();
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new property with features' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imgUrl', maxCount: 1 },
        { name: 'imgDocUrl', maxCount: 1 },
      ],
      {
        storage,
        fileFilter: (req, file, callback) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new BadRequestException('Only image files are allowed!'), false);
          }
          callback(null, true);
        },
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
      },
    ),
  )
  @ApiBody({ description: 'Property registration data', type: CreatePropertyDto })
  async registerProperty(
    @Body() createPropertyDto,
    @UploadedFiles() files: { imgUrl?: Express.Multer.File[], imgDocUrl?: Express.Multer.File[] }
  ) {
      if (!files.imgUrl || !files.imgDocUrl) {
        throw new BadRequestException('Please upload both images');
      }
      const propertyData = { ...createPropertyDto, imgUrl: files.imgUrl[0].path, imgDocUrl: files.imgDocUrl[0].path };
      return this.propertyService.createProperty(propertyData);
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
  @Roles('super_admin','owner')
  async updateProperty(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    console.log(updatePropertyDto);
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }

  @Patch(':id/features')
  @ApiOperation({ summary: 'Update the status of a feature for a property' })
  @ApiParam({ name: 'id', description: 'The ID of the property to update' })
  @ApiBody({ type: UpdateFeatureStatusDto })
  @Roles('super_admin','owner')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  async updateFeatureStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFeatureStatusDto: UpdateFeatureStatusDto,
  ) {
    return this.propertyService.updateFeatureStatus(id, updateFeatureStatusDto);
  }
}