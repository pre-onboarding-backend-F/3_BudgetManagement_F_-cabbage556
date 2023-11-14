import { CategoryExpense } from 'src/category-expenses';
import { BaseEntity } from 'src/global';
import { User } from 'src/users';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class MonthlyExpense extends BaseEntity {
	@Column({ type: 'smallint' })
	year: number;

	@Column({ type: 'smallint' })
	month: number;

	@Column()
	totalAmount: number;

	@ManyToOne(() => User, { nullable: false })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@OneToMany(() => CategoryExpense, (categoryExpense) => categoryExpense.monthlyExpense)
	categoryExpenses: CategoryExpense[];
}
