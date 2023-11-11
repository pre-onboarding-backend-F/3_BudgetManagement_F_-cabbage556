import { BaseEntity } from 'src/global';
import { User } from 'src/users';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Budget extends BaseEntity {
	@Column({ type: 'smallint' })
	year: number;

	@Column({ type: 'smallint' })
	month: number;

	@Column()
	totalAmount: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;
}
