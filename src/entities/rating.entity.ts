import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VisitorEntity } from './visitor.entity';
import { PropertyEntity as Property } from './property.entity';

@Entity('ratings')
export class RatingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => VisitorEntity, visitor => visitor.ratings)
    @JoinColumn({ name: 'visitor_id' })
    visitor: VisitorEntity;

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
