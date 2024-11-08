import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { VisitorEntity as Visitor } from './visitor.entity';
import { PropertyEntity as Property } from './property.entity';

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