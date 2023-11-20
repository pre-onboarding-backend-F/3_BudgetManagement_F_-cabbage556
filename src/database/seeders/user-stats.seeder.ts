import { Category } from 'src/categories';
import { CategoryBudget } from 'src/category-budgets';
import { CategoryExpense } from 'src/category-expenses';
import { getToday } from 'src/global';
import { MonthlyBudget } from 'src/monthly-budgets';
import { MonthlyExpense } from 'src/monthly-expenses';
import { User } from 'src/users';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export class UserStatsSeeder implements Seeder {
	async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
		const monthlyBudgetsRepository = dataSource.getRepository(MonthlyBudget);
		const categoryBudgetsRepository = dataSource.getRepository(CategoryBudget);
		const monthlyExpensesRepository = dataSource.getRepository(MonthlyExpense);
		const categoryExpensesRepository = dataSource.getRepository(CategoryExpense);
		const categoriesRepository = dataSource.getRepository(Category);

		const usersFactory = factoryManager.get(User);
		const monthlyBudgetsFactory = factoryManager.get(MonthlyBudget);
		const categoryBudgetsFactory = factoryManager.get(CategoryBudget);
		const monthlyExpensesFactory = factoryManager.get(MonthlyExpense);
		const categoryExpensesFactory = factoryManager.get(CategoryExpense);

		const categories = await categoriesRepository.find();
		const user = await usersFactory.save();
		const { month, day } = getToday();

		// 지난 달 월별 예산 생성 및 저장
		const fakeLastMonthlyBudget = await monthlyBudgetsFactory.make({ totalAmount: 0, month: month - 1, user });
		const lastMonthlyBudget = await monthlyBudgetsRepository.save(fakeLastMonthlyBudget);

		// 지난 달 카테고리별 예산 생성 및 저장
		const fakeLastMonthlyCategoryBudgets = await Promise.all(
			categories.map(
				async (category) => await categoryBudgetsFactory.make({ category, monthlyBudget: lastMonthlyBudget }),
			),
		);
		await categoryBudgetsRepository.save(fakeLastMonthlyCategoryBudgets);

		// 지난 달 월별 예산 전체 금액 업데이트 후 저장
		const lastMonthlyBudgetTotalAmount = fakeLastMonthlyCategoryBudgets.reduce(
			(prev, curr) => (prev += curr.amount),
			0,
		);
		lastMonthlyBudget.totalAmount = lastMonthlyBudgetTotalAmount;
		await monthlyBudgetsRepository.save(lastMonthlyBudget);

		// 이번 달 월별 예산 생성 및 저장
		const fakeThisMonthlyBudget = await monthlyBudgetsFactory.make({ totalAmount: 0, month, user });
		const thisMonthlyBudget = await monthlyBudgetsRepository.save(fakeThisMonthlyBudget);

		// 이번 달 카테고리별 예산 생성 및 저장
		const fakeThisMonthlyCategoryBudgets = await Promise.all(
			categories.map(
				async (category) => await categoryBudgetsFactory.make({ category, monthlyBudget: thisMonthlyBudget }),
			),
		);
		await categoryBudgetsRepository.save(fakeThisMonthlyCategoryBudgets);

		// 이번 달 월별 예산 전체 금액 업데이트 후 저장
		const thisMonthlyBudgetTotalAmount = fakeThisMonthlyCategoryBudgets.reduce(
			(prev, curr) => (prev += curr.amount),
			0,
		);
		thisMonthlyBudget.totalAmount = thisMonthlyBudgetTotalAmount;
		await monthlyBudgetsRepository.save(thisMonthlyBudget);

		// 지난 달 월별 지출 생성 및 저장
		const fakeLastMonthlyExpense = await monthlyExpensesFactory.make({ totalAmount: 0, month: month - 1, user });
		const lastMonthlyExpense = await monthlyExpensesRepository.save(fakeLastMonthlyExpense);

		// 지난 달 전체 카테고리별 지출 생성 및 저장
		//    1일부터 30일까지 하루마다 카테고리별 지출 생성
		const fakeLastMonthlyCategoryExpenses: CategoryExpense[] = [];
		for (let date = 1; date <= 30; date += 1) {
			const fakeCategoryExpensesAtDate = await Promise.all(
				categories.map(async (category) => {
					return await categoryExpensesFactory.make({
						category,
						monthlyExpense: lastMonthlyExpense,
						date,
					});
				}),
			);
			fakeLastMonthlyCategoryExpenses.push(...fakeCategoryExpensesAtDate);
		}
		await categoryExpensesRepository.save(fakeLastMonthlyCategoryExpenses);

		// 지난 달 월별 지출 전체 금액 업데이트 후 저장
		const lastMonthlyExpenseTotalAmount = fakeLastMonthlyCategoryExpenses.reduce(
			(prev, curr) => (prev += curr.excludingInTotal ? 0 : curr.amount),
			0,
		);
		lastMonthlyExpense.totalAmount = lastMonthlyExpenseTotalAmount;
		await monthlyExpensesRepository.save(lastMonthlyExpense);

		// 이번 달 월별 지출 생성 및 저장
		const fakeThisMonthlyExpense = await monthlyExpensesFactory.make({ totalAmount: 0, month, user });
		const thisMonthlyExpense = await monthlyExpensesRepository.save(fakeThisMonthlyExpense);

		// 이번 달 오늘까지의 카테고리별 지출 생성 및 저장
		//    1일부터 오늘까지 하루마다 카테고리별 지출 생성
		const fakeThisMonthlyCategoryExpenses: CategoryExpense[] = [];
		for (let date = 1; date <= day; date += 1) {
			const fakeCategoryExpensesAtDate = await Promise.all(
				categories.map(async (category) => {
					return await categoryExpensesFactory.make({
						category,
						monthlyExpense: thisMonthlyExpense,
						date,
					});
				}),
			);
			fakeThisMonthlyCategoryExpenses.push(...fakeCategoryExpensesAtDate);
		}
		await categoryExpensesRepository.save(fakeThisMonthlyCategoryExpenses);

		// 이번 달 월별 지출 전체 금액 업데이트 후 저장
		const thisMonthlyExpenseTotalAmount = fakeThisMonthlyCategoryExpenses.reduce(
			(prev, curr) => (prev += curr.excludingInTotal ? 0 : curr.amount),
			0,
		);
		thisMonthlyExpense.totalAmount = thisMonthlyExpenseTotalAmount;
		await monthlyExpensesRepository.save(thisMonthlyExpense);
	}
}
