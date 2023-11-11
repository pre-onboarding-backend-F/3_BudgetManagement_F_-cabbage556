import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Exclude()
	@CreateDateColumn()
	createdAt: Date;

	@Exclude()
	@UpdateDateColumn()
	updatedAt: Date;

	@Exclude()
	@DeleteDateColumn()
	deletedAt: Date;
}
