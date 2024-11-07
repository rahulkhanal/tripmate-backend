import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PropertyEntity as Property } from './property.entity';
import { FeatureEntity as Feature } from './feature.entity';

@Entity('property_features')
export class PropertyFeatureEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Property, property => property.propertyFeatures)
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @ManyToOne(() => Feature, feature => feature.propertyFeatures)
    @JoinColumn({ name: 'feature_id' })
    feature: Feature;

    @Column()
    status: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
