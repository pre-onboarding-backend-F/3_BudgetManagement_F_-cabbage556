import { Injectable } from '@nestjs/common';
import { CategoryBudgetsService } from 'src/category-budgets';
import { MonthlyBudget, MonthlyBudgetsService } from 'src/monthly-budgets';
import { SetBudgetDto } from './dto';
import { CategoriesAmount, getDate, getLowercaseCategoryNameEnumKey, getTotalAmount } from 'src/global';
import { User } from 'src/users';
import { CategoriesService } from 'src/categories';

@Injectable()
export class BudgetsService {
	constructor(
		private readonly monthlyBudgetsService: MonthlyBudgetsService,
		private readonly categoryBudgetsService: CategoryBudgetsService,
		private readonly categoriesService: CategoriesService,
	) {}

	async setBudget(setBudgetDto: SetBudgetDto, user: User) {
		const { yyyyMM, ...categoriesAmount } = setBudgetDto;
		const { year, month } = getDate(yyyyMM);
		const totalAmount = getTotalAmount(categoriesAmount);

		const oldMonthlyBudget = await this.monthlyBudgetsService.findOne({
			year,
			month,
			user: {
				id: user.id,
			},
		});
		// 월별 예산이 이미 존재하는 경우 월별 예산과 카테고리별 예산 업데이트
		if (oldMonthlyBudget) {
			return await this.updateBudgets(oldMonthlyBudget, categoriesAmount, totalAmount);
		}
		// 월별 예산이 존재하지 않는 경우 월별 예산과 카테고리별 예산 생성 후 저장
		else {
			return await this.saveNewBudgets(year, month, totalAmount, user, categoriesAmount);
		}
	}

	async updateBudgets(
		monthlyBudget: MonthlyBudget, //
		categoriesAmount: CategoriesAmount,
		totalAmount: number,
	) {
		// 월별 예산 전체 금액이 변경된 경우에만 월별 예산 업데이트
		if (monthlyBudget.totalAmount !== totalAmount) {
			monthlyBudget.totalAmount = totalAmount;
			await this.monthlyBudgetsService.saveOne(monthlyBudget);
		}
		const oldCategoryBudgets = await this.categoryBudgetsService.findMany({
			monthlyBudget: {
				id: monthlyBudget.id,
			},
		});
		oldCategoryBudgets.forEach((categoryBudget) => {
			const categoryName = getLowercaseCategoryNameEnumKey(categoryBudget.category.name);
			if (categoriesAmount[categoryName] !== categoryBudget.amount) {
				categoryBudget.amount = categoriesAmount[categoryName];
				return;
			}
		});
		const categoryBudgets = await this.categoryBudgetsService.saveMany(oldCategoryBudgets);

		return {
			monthlyBudget,
			categoryBudgets,
		};
	}

	async saveNewBudgets(
		year: number,
		month: number,
		totalAmount: number,
		user: User,
		categoriesAmount: CategoriesAmount,
	) {
		const createdMonthlyBudget = this.monthlyBudgetsService.createOne({ year, month, totalAmount, user });
		const monthlyBudget = await this.monthlyBudgetsService.saveOne(createdMonthlyBudget);
		const categories = await this.categoriesService.findAll();
		const createdCategoryBudgets = [];
		categories.forEach((category) => {
			const categoryName = getLowercaseCategoryNameEnumKey(category.name);
			// 카테고리별 예산 생성
			createdCategoryBudgets.push(
				this.categoryBudgetsService.createOne({
					amount: categoriesAmount[categoryName],
					category,
					monthlyBudget,
				}),
			);
		});
		const categoryBudgets = await this.categoryBudgetsService.saveMany(createdCategoryBudgets);

		return {
			monthlyBudget,
			categoryBudgets,
		};
	}
}
