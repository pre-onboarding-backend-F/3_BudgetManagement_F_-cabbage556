import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { User } from 'src/users';
import { MonthlyBudget } from 'src/monthly-budgets';
import { CategoryBudget } from 'src/category-budgets';
import { Category } from 'src/categories';

export class MainSeeder implements Seeder {
	async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
		const categoriesRepository = dataSource.getRepository(Category);
		const monthlyBudgetsRepository = dataSource.getRepository(MonthlyBudget);
		const categoryBudgetsRepository = dataSource.getRepository(CategoryBudget);

		const usersFactory = factoryManager.get(User);
		const monthlyBudgetsFactory = factoryManager.get(MonthlyBudget);
		const categoryBudgetsFactory = factoryManager.get(CategoryBudget);

		// 랜덤 유저 10명 저장
		const users = await usersFactory.saveMany(10);
		const categories = await categoriesRepository.find();

		// 랜덤 월별 예산 10개 생성
		const fakeMonthlyBudgets = await Promise.all(
			Array(10)
				.fill('')
				.map(async (_, i) => {
					const fakeUser = users[i];
					return await monthlyBudgetsFactory.make({
						user: fakeUser,
						totalAmount: 0,
					});
				}),
		);
		// 랜덤 월별 예산 10개 저장
		const monthlyBudgets = await monthlyBudgetsRepository.save(fakeMonthlyBudgets);

		await Promise.all(
			monthlyBudgets.map(async (monthlyBudget) => {
				// 랜덤 카테고리별 예산 생성
				const fakeCategoryBudgets = await Promise.all(
					categories.map(async (category) => {
						return await categoryBudgetsFactory.make({
							category,
							monthlyBudget,
						});
					}),
				);
				// 카테고리별 예산 전체 금액 계산
				const totalAmount = fakeCategoryBudgets.reduce((prev, curr) => (prev += curr.amount), 0);

				// 랜덤 카테고리별 예산 저장
				await categoryBudgetsRepository.save(fakeCategoryBudgets);

				// 월별 예산 전첵 금액 업데이트
				monthlyBudget.totalAmount = totalAmount;
			}),
		);

		// 월별 예산 저장
		await monthlyBudgetsRepository.save(monthlyBudgets);
	}
}
