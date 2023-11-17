import { CategoryBudget } from 'src/category-budgets';
import { setSeederFactory } from 'typeorm-extension';

export const CategoryBudgetsFactory = setSeederFactory(CategoryBudget, (faker) => {
	const categoryBudget = new CategoryBudget();

	// 카테고리별 예산 금액: 10만원, 20만원, 30만원, 40만원, 50만원 중 랜덤
	categoryBudget.amount = faker.helpers.arrayElement([100000, 200000, 300000, 400000, 500000]);

	return categoryBudget;
});
