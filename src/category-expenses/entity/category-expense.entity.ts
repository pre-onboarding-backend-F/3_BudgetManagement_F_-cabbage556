import { Category } from 'src/categories';
import { BaseEntity } from 'src/global';
import { MonthlyExpense } from 'src/monthly-expenses';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class CategoryExpense extends BaseEntity {
	@Column({ type: 'smallint' })
	date: number;

	@Column()
	memo: string;

	@Column({ default: 0 })
	amount: number;

	@Column()
	excludingInTotal: boolean;

	@ManyToOne(() => MonthlyExpense, { nullable: false })
	@JoinColumn({ name: 'monthly_expense_id' })
	monthlyExpense: MonthlyExpense;

	@ManyToOne(() => Category, { nullable: false })
	@JoinColumn({ name: 'category_id' })
	category: Category;
}
