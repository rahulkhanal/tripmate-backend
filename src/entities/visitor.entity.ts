import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VisitEntity as Visit } from './visit.entity';
import { RatingEntity as Rating } from './rating.entity';

@Entity('visitors')
export class VisitorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    photo: string;

    @Column({unique: true})
    email: string;

    @Column()
    password_hash: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => Visit, visit => visit.visitor)
    visits: Visit[];

    @OneToMany(() => Rating, rating => rating.visitor)
    ratings: Rating[];
}
