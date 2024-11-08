import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from 'typeorm';
import { PropertyEntity } from './property.entity';
import { PropertyFeatureEntity as PropertyFeature } from './property_feature.entity';

@Entity('features')
export class FeatureEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => PropertyFeature, propertyFeature => propertyFeature.feature, { onDelete: 'CASCADE' })
    propertyFeatures: PropertyFeature[];
}