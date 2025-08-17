import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PropertyEntity } from 'src/entities/property.entity';
import { In, Repository } from 'typeorm';
import { PropertyFeatureEntity } from 'src/entities/property_feature.entity';
import { FeatureEntity } from 'src/entities/feature.entity';
import { RatingEntity } from 'src/entities/rating.entity';
import { VisitEntity } from 'src/entities/visit.entity';
import { VisitorEntity } from 'src/entities/visitor.entity';
import { BookingDto, updateBookingDto } from './dto/BookingDto';
import { RatingDto } from './dto/RatingDto';
import { MailDto } from './dto/MailDto';
import * as nodemailer from 'nodemailer';
import { SuperAdmin } from 'src/entities/super_admin.entity';

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
    const visitor = await this.visitorRepository.findOne({ where: { id: visitorId } });
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
      relations: ['visits', 'ratings', 'visits.property', 'ratings.property'],
    });
    // if (!visitor.ratings.length) {
    //   return { message: "You haven't rated any tour yet. so, you can't get recommendations", data: [] };
    // }
    const relevantPropertyIds = visitor.visits.map(visit => visit.property.id);
    const visitorFeatures = await this.propertyFeatureRepository.find({
      where: { property: { id: In(relevantPropertyIds) }, status: true },
      relations: ['feature'],
    });
    // console.log(visitorFeatures);
    const visitorFeatureIds = new Set(visitorFeatures.map(feature => feature.feature.id));
    // console.log("visitorFeatureIds", visitorFeatureIds);
    const allProperties = await this.propertyRepository.find({ relations: ['propertyFeatures', 'propertyFeatures.feature'] });
    // console.log('allProperties', allProperties);
    const recommendations = allProperties.map(property => {
      const propertyFeatureIds = property.propertyFeatures.map(pf => pf.feature.id);
      // console.log('propertyFeatureIds', propertyFeatureIds);
      const similarityScore = this.calculateCosineSimilarity(visitorFeatureIds, new Set(propertyFeatureIds));
      return { property, similarityScore };
    });

    // console.log(recommendations);
    const sortedRecommendations = recommendations
      .filter(rec => rec.similarityScore > 0)  // Only properties with non-zero similarity
      .sort((a, b) => b.similarityScore - a.similarityScore)  // Sort by highest score first
      .slice(0, 5); // Limit to top 5 recommendations

    const sortedItem = sortedRecommendations.map((item) => {
      delete item.property.propertyFeatures;
      return item;
    });
    return { message: 'Recommendations', data: sortedItem }

  }

  async getUserBasedRecommendations(userId: number) {
    const K: number = 10;
    // --- Step 1: Fetch and Prepare Interaction Profile for the Target User (userId) ---
    const targetUser = await this.visitorRepository.findOne({
      where: { id: userId },
      relations: ['visits', 'visits.property', 'ratings', 'ratings.property'],
    });

    const targetUserInteractions: { [propertyId: number]: number } = {};
    const targetUserAlreadyInteractedPropertyIds = new Set<number>();

    targetUser.visits.forEach(v => {
      if (v.property) {
        targetUserInteractions[v.property.id] = 1;
        targetUserAlreadyInteractedPropertyIds.add(v.property.id);
      }
    });
    targetUser.ratings.forEach(r => {
      if (r.property) {
        targetUserInteractions[r.property.id] = r.rating_score;
        targetUserAlreadyInteractedPropertyIds.add(r.property.id);
      }
    });


    // --- Step 2: Fetch and Prepare Interaction Profiles for ALL Other Users (potential neighbors) ---
    const allOtherVisitors = await this.visitorRepository.find({
      where: {
        id: In([ // Get all visitor IDs first, then filter out the target user
          ...(await this.visitorRepository.find({ select: ['id'] })).map(v => v.id)
        ].filter(id => id !== userId))
      },
      relations: ['visits', 'visits.property', 'ratings', 'ratings.property'],
    });

    const potentialNeighborsProfiles: { visitor: VisitorEntity; interactions: { [propertyId: number]: number } }[] = [];

    for (const otherVisitor of allOtherVisitors) {
      const interactions: { [propertyId: number]: number } = {};
      otherVisitor.visits.forEach(v => {
        if (v.property) interactions[v.property.id] = 1;
      });
      otherVisitor.ratings.forEach(r => {
        if (r.property) interactions[r.property.id] = r.rating_score;
      });
      // Only add users with some interactions to be a potential neighbor for similarity calculation
      if (Object.keys(interactions).length > 0) {
        potentialNeighborsProfiles.push({ visitor: otherVisitor, interactions });
      }
    }

    // --- Step 3: Calculate Similarities between Target User and ALL Other Users ---
    const userSimilarities: { visitor: VisitorEntity; score: number }[] = [];
    for (const neighborProfile of potentialNeighborsProfiles) {
      // Use Pearson Correlation to find similarity between target user and this neighbor
      const similarity = this.calculatePearsonCorrelation(targetUserInteractions, neighborProfile.interactions);
      if (similarity > 0) { // Only consider positively correlated neighbors
        userSimilarities.push({ visitor: neighborProfile.visitor, score: similarity });
      }
    }

    // --- Step 4: Select the K-Nearest Neighbors ---
    // Sort by similarity score in descending order and take the top K
    const nearestNeighbors = userSimilarities
      .sort((a, b) => b.score - a.score)
      .slice(0, K);

    if (nearestNeighbors.length === 0) {
      return { message: "No similar users found to generate recommendations.", data: [] };
    }

    const recommendedPropertiesScores: { [propertyId: number]: { scoreSum: number, similaritySum: number } } = {};

    for (const neighbor of nearestNeighbors) {
      const neighborInteractions = neighbor.visitor.ratings.length > 0
        ? neighbor.visitor.ratings.reduce((acc, r) => { // Prioritize ratings
          if (r.property) acc[r.property.id] = r.rating_score;
          return acc;
        }, {})
        : neighbor.visitor.visits.reduce((acc, v) => { // Fallback to visits if no ratings
          if (v.property) acc[v.property.id] = 1;
          return acc;
        }, {});

      for (const propertyIdStr in neighborInteractions) {
        const propertyId = parseInt(propertyIdStr);
        // --- Step 6: Filter out Properties Already Known by Target User ---
        // Only consider properties the target user has NOT interacted with yet
        if (!targetUserAlreadyInteractedPropertyIds.has(propertyId)) {
          const interactionValue = neighborInteractions[propertyId];

          // Initialize score if this property is encountered first time
          if (!recommendedPropertiesScores[propertyId]) {
            recommendedPropertiesScores[propertyId] = { scoreSum: 0, similaritySum: 0 };
          }
          // Aggregate score: similarity * neighbor's interaction value (e.g., rating)
          recommendedPropertiesScores[propertyId].scoreSum += neighbor.score * interactionValue;
          // Also sum similarities for potential averaging (e.g., weighted average prediction)
          recommendedPropertiesScores[propertyId].similaritySum += neighbor.score;
        }
      }
    }

    // Convert aggregated scores to final recommendations
    const finalRecommendationsList: { propertyId: number; predictedScore: number }[] = [];
    for (const propertyId in recommendedPropertiesScores) {
      const scores = recommendedPropertiesScores[propertyId];
      // Calculate predicted score (e.g., weighted average of neighbor ratings)
      // If similaritySum is 0, it means all neighbors had 0 similarity to the target user, so predicted score is 0
      const predictedScore = scores.similaritySum > 0 ? scores.scoreSum / scores.similaritySum : 0;
      finalRecommendationsList.push({ propertyId: parseInt(propertyId), predictedScore });
    }

    // --- Step 7: Rank and Return Final Recommendations ---
    // Filter out properties with a predicted score of 0 (no meaningful recommendation)
    // Sort by predicted score in descending order
    // Limit to top 5 recommendations (you can make this a parameter too)
    const sortedRecommendations = finalRecommendationsList
      .filter(rec => rec.predictedScore > 0)
      .sort((a, b) => b.predictedScore - a.predictedScore)
      .slice(0, 5); // Example: return top 5 recommendations

    // Fetch full PropertyEntity details for the recommended IDs
    const recommendedPropertyIds = sortedRecommendations.map(rec => rec.propertyId);
    let recommendedPropertiesDetails: PropertyEntity[] = [];
    if (recommendedPropertyIds.length > 0) {
      recommendedPropertiesDetails = await this.propertyRepository.find({
        where: { id: In(recommendedPropertyIds) },
      });
    }

    // Map back predicted scores to the full property objects
    const result = sortedRecommendations.map(rec => ({
      property: recommendedPropertiesDetails.find(p => p.id === rec.propertyId),
      predictedScore: rec.predictedScore
    }));

    // Handle case where no recommendations could be generated
    if (result.length === 0) {
      return { message: "No relevant recommendations could be generated based on similar users.", data: [] };
    }

    return { message: 'UBCF Recommendations', data: result };
  }

  private calculateCosineSimilarity(visitorFeatures: Set<number>, propertyFeatures: Set<number>): number {
    // console.log('visitorFeatures', visitorFeatures);
    // console.log(  'propertyFeatures', propertyFeatures);
    const intersection = new Set([...visitorFeatures].filter(x => propertyFeatures.has(x)));
    // console.log(intersection.size);
    const cosineSimilarity = intersection.size / Math.sqrt(visitorFeatures.size * propertyFeatures.size);
    return cosineSimilarity;
  }

  private calculatePearsonCorrelation(
    vec1: { [propertyId: number]: number },
    vec2: { [propertyId: number]: number }
  ): number {
    const commonPropertyIds = Array.from(
      new Set(Object.keys(vec1).filter(id => id in vec2).map(Number))
    );

    if (commonPropertyIds.length === 0) {
      return 0; // No common items, correlation cannot be calculated
    }

    const x = commonPropertyIds.map(id => vec1[id]);
    const y = commonPropertyIds.map(id => vec2[id]);

    const n = commonPropertyIds.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;

      numerator += diffX * diffY;
      denominatorX += diffX * diffX;
      denominatorY += diffY * diffY;
    }

    const denominator = Math.sqrt(denominatorX) * Math.sqrt(denominatorY);

    if (denominator === 0) {
      // This occurs if one or both users have no variance in their common ratings
      // (e.g., they both rated all common items with the exact same score).
      // In this specific case, they are perfectly correlated for those items.
      // However, for practical recommendations, a 0 is safer than NaN for no variance.
      return 0;
    }

    return numerator / denominator;
  }


  async getOwnerBookings(ownerId: number) {
    const visits = await this.visitRepository.find({ where: { property: { id: ownerId } }, relations: ['visitor'] });
    if (!visits) return [];
    return visits;
  }
}