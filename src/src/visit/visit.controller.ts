import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, UseGuards, Query } from '@nestjs/common';
import { VisitService } from './visit.service';
import { VisitEntity } from 'src/entities/visit.entity';
import { Roles } from 'src/middleware/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/middleware/roles.guard';
import { AtGuard } from 'src/middleware/at.guard';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingDto, updateBookingDto } from './dto/BookingDto';
import { RatingDto } from './dto/RatingDto';
import { MailDto } from './dto/MailDto';

enum bookingStatus {
  booked = 'booked',
  visited = 'visited',
  cancelled = 'cancelled', 
}

@Controller('visit')
export class VisitController {
  constructor(private readonly visitService: VisitService) { }

  @Post('book')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Book a tour' })
  async bookTour(
    @Req() req,
    @Body() bookingDto: BookingDto,
  ) {
    const { user } = req;
    return this.visitService.bookTour(user.id, bookingDto);
  }

  @Get('get-my-bookings')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get bookings of the current user' })
  @ApiQuery({ name: 'status', required: false, type: String, enum: bookingStatus })
  async getMyBookings(@Req() req, @Query('status') status: bookingStatus,
  ) {
    const { user } = req;
    return this.visitService.getMyBookings(user.id, status);
  }

  @Get('get-all-bookings')
  @Roles('super_admin', 'owner')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'status', required: false, type: String, enum: bookingStatus })
  @ApiQuery({ name: 'userType', required: false, type: String })
  async getAllBookings(
    @Query('status') status: bookingStatus,
    @Query('userType') userType,
    @Req() req,
  ) {
    if (userType === 'owner') {
      const { user } = req;
      return this.visitService.getOwnerBookings(user.id);
    }
    return this.visitService.getAllBookings(status);
  }

  @Patch('update-booking')
  @Roles('visitor', 'super_admin')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Update booking' })
  async updateBooking(
    @Req() req,
    @Body() bookingDto: updateBookingDto
  ) {
    const { user } = req;
    return this.visitService.updateBooking(user.id, bookingDto);
  }

  @Post('rate')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Rate a tour' })
  async rateTour(
    @Req() req,
    @Body() ratingDto: RatingDto,
  ) {
    const { user } = req;
    console.log(user);
    return this.visitService.rateTour(user.id, ratingDto);
  }

  @Post('send-mail')
  @Roles('super_admin')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Send mail to property owner' })
  async sendMailToPropertyOwner(@Body() mailData: MailDto) {
    await this.visitService.sendMail(mailData);
  }

  @Get('recommendations')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  async getRecommendations(@Req() req) {
    const { user } = req;
    const visitorId = user.id;
    return await this.visitService.getRecommendations(visitorId);
  }

  @Get('calculate-knn')
  @Roles('visitor')
  @UseGuards(AtGuard, RolesGuard)
  @ApiBearerAuth('access_token')
  async calculateKNN(@Req() req) {
    const { user } = req;
    const visitorId = user.id;
    const recommendations = await this.visitService.getUserBasedRecommendations(visitorId);
    return recommendations;
  }
}