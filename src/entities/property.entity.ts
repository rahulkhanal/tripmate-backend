import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VisitEntity as Visit } from './visit.entity';
import { RatingEntity as Rating } from './rating.entity';
import { PropertyFeatureEntity as PropertyFeature } from './property_feature.entity';

@Entity('properties')
export class PropertyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    category: string;

    @Column()
    location: string;

    @Column('text')
    description: string;

    @Column({ default: 0 })
    price: number;

    @Column({ type: 'text' })
    imgUrl: string;

    @Column({ type: 'text' })
    imgDocUrl: string;

    @Column({ default: false })
    verified: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Visit, visit => visit.property)
    visits: Visit[];

    @OneToMany(() => Rating, rating => rating.property)
    ratings: Rating[];

    @OneToMany(() => PropertyFeature, propertyFeature => propertyFeature.property, { onDelete: 'CASCADE' })
    propertyFeatures: PropertyFeature[];

    @Column({ type: 'text', nullable: true })
    password: string;
}
