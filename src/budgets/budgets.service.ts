import { Injectable } from '@nestjs/common';
import { CategoryBudget, CategoryBudgetsService } from 'src/category-budgets';
import { MonthlyBudget, MonthlyBudgetsService } from 'src/monthly-budgets';
import { GetBudgetRecommendQueryDto, SetBudgetDto } from './dto';
import {
	CategoriesAmount,
	CategoryName,
	getDate,
	getLowercaseCategoryNameEnumKey,
	getToday,
	getTotalAmount,
} from 'src/global';
import { User } from 'src/users';
import { CategoriesService } from 'src/categories';
import { CategoryRecommendAmount } from './interfaces/category-recommend-amount';
import { CategoryBudgetAmount } from './interfaces/category-budget-amount';

@Injectable()
export class BudgetsService {
	constructor(
		private readonly monthlyBudgetsService: MonthlyBudgetsService,
		private readonly categoryBudgetsService: CategoryBudgetsService,
		private readonly categoriesService: CategoriesService,
	) {}

	async setBudget(setBudgetDto: SetBudgetDto, user: User) {
		const { yyyyMm, ...categoriesAmount } = setBudgetDto;
		const { year, month } = getDate(yyyyMm);
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

		// 월별 예산에 해당하는 카테고리별 예산 조회
		const oldCategoryBudgets = await this.categoryBudgetsService.findMany(
			{ monthlyBudget: { id: monthlyBudget.id } }, //
			{ category: true },
		);

		oldCategoryBudgets.forEach((categoryBudget) => {
			const categoryName = categoryBudget.category.name;
			const nameEnumKey = getLowercaseCategoryNameEnumKey(categoryName);
			categoryBudget.amount = categoriesAmount[nameEnumKey];
		});
		const categoryBudgets = await this.categoryBudgetsService.saveMany(oldCategoryBudgets);

		// 응답 배열 생성
		const categoryBudgetAmounts: CategoryBudgetAmount[] = [];
		categoryBudgets.forEach((categoryBudget) => {
			categoryBudgetAmounts.push({ category: categoryBudget.category.name, budgetAmount: categoryBudget.amount });
		});

		delete monthlyBudget.id;

		return {
			monthlyBudget,
			categoryBudgets: categoryBudgetAmounts,
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

		const createdCategoryBudgets: CategoryBudget[] = [];
		categories.forEach((category) => {
			const categoryName = getLowercaseCategoryNameEnumKey(category.name);
			const amount = categoriesAmount[categoryName];

			// 카테고리별 예산 생성
			createdCategoryBudgets.push(this.categoryBudgetsService.createOne({ amount, category, monthlyBudget }));
		});
		const categoryBudgets = await this.categoryBudgetsService.saveMany(createdCategoryBudgets);

		// 응답 배열 생성
		const categoryBudgetAmounts: CategoryBudgetAmount[] = [];
		categoryBudgets.forEach((categoryBudget) => {
			categoryBudgetAmounts.push({ category: categoryBudget.category.name, budgetAmount: categoryBudget.amount });
		});

		delete monthlyBudget.id;
		delete monthlyBudget.user;

		return {
			monthlyBudget,
			categoryBudgets: categoryBudgetAmounts,
		};
	}

	async getBudgetRecommend(dto: GetBudgetRecommendQueryDto) {
		const { totalAmount } = dto;
		const { year, month } = getToday();

		const take = 50; // 기준 월별 예산 50개 선택
		const skip = Math.floor(Math.random() * 10) + 1; // 1 ~ 10개의 월별 예산 생략
		const monthlyBudgets = await this.monthlyBudgetsService.findMany(
			{ year, month },
			{ categoryBudgets: { category: true } },
			take,
			skip,
		);

		// 카테고리별 예산 금액의 각 퍼센트 계산
		const categoryPercents = new Map<string, number[]>();
		monthlyBudgets.forEach((monthlyBudget) => {
			monthlyBudget.categoryBudgets.forEach((categoryBudget) => {
				const categoryName = categoryBudget.category.name;
				const percents = categoryPercents.get(categoryName) ?? [];
				let percent = 0;

				// 카테고리 이름이 '음식' 또는 '생활'인 경우 올림, 나머지의 경우 내림으로 퍼센트 계산
				if (categoryName === CategoryName.FOOD || categoryName === CategoryName.LIVING) {
					percent = Math.ceil((categoryBudget.amount / monthlyBudget.totalAmount) * 100);
				} else {
					percent = Math.floor((categoryBudget.amount / monthlyBudget.totalAmount) * 100);
				}

				percents.push(percent);
				categoryPercents.set(categoryName, percents);
			});
		});

		// 카테고리별 예산 금액의 각 퍼센트의 평균을 구해 카테고리별 추천 예산 금액 계산
		let categoryTotalAmount = 0;
		const categoryRecommendAmounts: CategoryRecommendAmount[] = [];
		for (const [categoryName, percents] of categoryPercents) {
			const categoryPercentAvg = Math.round(percents.reduce((prev, curr) => (prev += curr), 0) / percents.length); // 카테고리별 퍼센트의 평균
			const categoryRecommendAmount = (totalAmount * categoryPercentAvg) / 100; // 카테고리별 추천 예산 금액

			categoryRecommendAmounts.push({ category: categoryName, recommendAmount: categoryRecommendAmount });
			categoryTotalAmount += categoryRecommendAmount;
		}

		// 오차가 발생할 경우 '카페' 카테고리의 추천 예산 금액에 더하기
		const amountDifference = totalAmount - categoryTotalAmount;
		if (amountDifference > 0) {
			const cafeIndex = categoryRecommendAmounts.findIndex(
				(categoryRecommendAmount) => categoryRecommendAmount.category === CategoryName.CAFE,
			);
			if (cafeIndex !== -1) {
				categoryRecommendAmounts[cafeIndex].recommendAmount += amountDifference;
			}
		}

		return categoryRecommendAmounts;
	}
}
