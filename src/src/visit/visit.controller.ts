import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { VisitService } from './visit.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { VisitEntity } from 'src/entities/visit.entity';
import { Roles } from 'src/middleware/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/middleware/roles.guard';
import { AtGuard } from 'src/middleware/at.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) { }

  @Post('book/:propertyId')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  async bookTour(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Req() req,
  ) {
    const { user } = req;
    console.log(user);
    // return this.visitService.bookTour(visitorId, propertyId);
  }

}
