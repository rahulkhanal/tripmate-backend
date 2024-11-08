import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { VisitorEntity } from './visitor.entity';
import { PropertyEntity as Property } from './property.entity';
import { VisitEntity } from './visit.entity';

@Entity('ratings')
export class RatingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => VisitorEntity, visitor => visitor.ratings)
    @JoinColumn({ name: 'visitor_id' })
    visitor: VisitorEntity;

    @OneToOne(() => VisitEntity, visit => visit.rate, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'booking_id' })
    visit: VisitEntity;

    @ManyToOne(() => Property, property => property.ratings)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @Column({ type: 'float' })
    rating_score: number;

    @Column('text')
    review: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}