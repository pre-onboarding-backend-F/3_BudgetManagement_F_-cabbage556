import { BaseEntity } from 'src/global';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
	@Column({
		unique: true,
	})
	account: string;

	@Column()
	password: string;

	@Column()
	refreshToken: string;
}
