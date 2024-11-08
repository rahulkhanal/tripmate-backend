import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { VisitorEntity as Visitor } from './visitor.entity';
import { PropertyEntity as Property } from './property.entity';
import { RatingEntity } from './rating.entity';

@Entity('visits')
export class VisitEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Visitor, visitor => visitor.visits)
    @JoinColumn({ name: 'visitor_id' })
    visitor: Visitor;

    @ManyToOne(() => Property, property => property.visits)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @OneToOne(() => RatingEntity, rating => rating.visit)
    rate: RatingEntity;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({ type: 'enum', enum: ['booked', 'visited', 'cancelled'], default: 'booked' })
    status: 'booked' | 'visited';

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}