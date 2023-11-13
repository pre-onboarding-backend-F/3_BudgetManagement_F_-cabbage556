import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/global';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@Column({ unique: true })
	username: string;

	@Exclude()
	@Column()
	password: string;

	@Exclude()
	@Column({ nullable: true })
	refreshToken: string;
}
