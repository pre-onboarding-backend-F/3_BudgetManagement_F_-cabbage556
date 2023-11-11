import { BaseEntity, CategoryName } from 'src/global';
import { Column, Entity } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
	@Column({ type: 'enum', enum: CategoryName, unique: true })
	name: CategoryName;
}
