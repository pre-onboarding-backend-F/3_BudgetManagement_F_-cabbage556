import { CategoryBudget } from 'src/category-budgets';
import { setSeederFactory } from 'typeorm-extension';

export const CategoryBudgetsFactory = setSeederFactory(CategoryBudget, (faker) => {
	const categoryBudget = new CategoryBudget();

	// 카테고리별 예산 금액: 10만원, 20만원, 30만원, 40만원, 50만원 중 랜덤
	categoryBudget.amount = faker.helpers.weightedArrayElement([
		{ weight: 3, value: 100000 }, // 10만원 확률 30%
		{ weight: 3, value: 200000 }, // 20만원 확률 30%
		{ weight: 2, value: 300000 }, // 30만원 확률 20%
		{ weight: 1, value: 400000 }, // 40만원 확률 10%
		{ weight: 1, value: 500000 }, // 50만원 확률 10%
	]);

	return categoryBudget;
});
