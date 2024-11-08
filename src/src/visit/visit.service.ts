import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyEntity } from 'src/entities/property.entity';
import { Repository } from 'typeorm';
import { PropertyFeatureEntity } from 'src/entities/property_feature.entity';
import { FeatureEntity } from 'src/entities/feature.entity';
import { RatingEntity } from 'src/entities/rating.entity';
import { VisitEntity } from 'src/entities/visit.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { BookingDto, updateBookingDto } from './dto/BookingDto';
import { RatingDto } from './dto/RatingDto';
import { MailDto } from './dto/MailDto';
import * as nodemailer from 'nodemailer';

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

  async bookTour(visitorId: number, bookingDto: BookingDto) {
    const { propertyId, startDate, endDate } = bookingDto;
    const property = await this.propertyRepository.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException(`Property with ID ${propertyId} not found`);
    const visitor = await this.visitorRepository.findOne({ where: { id: visitorId } });
    if (!visitor) throw new NotFoundException(`Visitor with ID ${visitorId} not found`);
    if (startDate > endDate) throw new BadRequestException('Start date should be less than end date');
    const visit = this.visitRepository.create({ visitor, property, startDate, endDate });
    return this.visitRepository.save(visit);
  }

  async getMyBookings(visitorId: number, status) {
    const visits = await this.visitRepository.find({ where: { visitor: { id: visitorId }, status }, relations: ['property', 'rate'] });
    if (!visits) return [];
    return visits;
  }

  async getAllBookings(status) {
    const visits = await this.visitRepository.find({ where: { status }, relations: ['property', 'visitor'] });
    if (!visits) return [];
    return visits;
  }

  async updateBooking(visitorId: number, bookingDto: updateBookingDto) {
    const visit = await this.visitRepository.findOne({ where: { id: visitorId } });
    if (!visit) throw new NotFoundException(`Visit with ID ${visitorId} not found`);
    const updatedVisit = Object.assign(visit, bookingDto);
    return await this.visitRepository.save(updatedVisit);
  }

  async rateTour(visitorId: number, ratingDto: RatingDto) {
    const visit = await this.visitRepository.findOne({ where: { id: ratingDto.visit } });
    if (!visit) throw new NotFoundException(`Visit with ID ${visitorId} not found`);
    const visitor = await this.visitRepository.findOne({ where: { id: visitorId } });
    if (!visitor) throw new NotFoundException(`Visitor with ID ${visitorId} not found`);
    const property = await this.propertyRepository.findOne({ where: { id: ratingDto.property } });
    if (!property) throw new NotFoundException(`Property with ID ${ratingDto.property} not found`);
    const rating = this.ratingRepository.create({ visitor: visitor, rating_score: ratingDto.rating_score, review: ratingDto.review, property: property, visit: visit });
    return this.ratingRepository.save(rating);
  }

  async sendMail(mailData: MailDto) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_ID,
      to: mailData.to,
      subject: 'Booking Confirmation',
      text: mailData.body,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  async getRecommendations(visitorId: number) {
    const visitor = await this.visitorRepository.findOne({
      where: { id: visitorId },
      relations: ['visits', 'ratings'],
    });
    if (!visitor.ratings.length) {
      return { message: "You haven't rated any tour yet. so, you can't get recommendations", data: [] };
    }
    console.log(visitor);
    const visitedPropertyIds = visitor.visits.map(visit => visit.property.id);
    // console.log(visitedPropertyIds);
  }
}