import { BaseEntity } from 'src/global';
import { Column, Entity } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
	@Column({ unique: true })
	name: string;
}
