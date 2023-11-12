import { Category } from 'src/categories';
import { BaseEntity } from 'src/global';
import { MonthlyBudget } from 'src/monthly-budgets';
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

	@ManyToOne(() => MonthlyBudget, { nullable: false })
	@JoinColumn()
	monthlyExpense: MonthlyExpense;

	@ManyToOne(() => Category, { nullable: false })
	@JoinColumn()
	category: Category;
}
