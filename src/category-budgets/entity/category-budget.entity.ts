import { MonthlyBudget } from 'src/monthly-budgets';
import { Category } from 'src/categories';
import { BaseEntity } from 'src/global';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class CategoryBudget extends BaseEntity {
	@Column({ default: 0 })
	amount: number;

	@ManyToOne(() => Category, { nullable: false })
	@JoinColumn({ name: 'category_id' })
	category: Category;

	@ManyToOne(() => MonthlyBudget, { nullable: false })
	@JoinColumn({ name: 'monthly_budget_id' })
	monthlyBudget: MonthlyBudget;
}
