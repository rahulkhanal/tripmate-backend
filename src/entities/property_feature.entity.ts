import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PropertyEntity as Property } from './property.entity';
import { FeatureEntity as Feature } from './feature.entity';

@Entity('property_features')
export class PropertyFeatureEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Property, property => property.propertyFeatures,{ onDelete: 'CASCADE' })
    @JoinColumn({ name: 'property_id' })
    property: Property;

    @ManyToOne(() => Feature, feature => feature.propertyFeatures, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'feature_id' })
    feature: Feature;

    @Column()
    status: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
