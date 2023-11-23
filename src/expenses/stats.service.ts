import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CategoryExpensesService } from 'src/category-expenses';
import {
	CategoryAndRatio,
	CategoryAndSum,
	CategoryName,
	getLastMonthDate,
	getLastWeekDate,
	getToday,
} from 'src/global';
import { MonthlyExpensesService } from 'src/monthly-expenses';
import { User, UsersService } from 'src/users';
import { ExpenseException } from './enums';

@Injectable()
export class StatsService {
	constructor(
		private readonly monthlyExpensesService: MonthlyExpensesService,
		private readonly categoryExpensesService: CategoryExpensesService,
		private readonly usersService: UsersService,
	) {}

	async getExpensesStats(user: User) {
		const { year, month, day } = getToday();
		const { year: lastMonthYear, month: lastMonth } = getLastMonthDate({ year, month });

		// 요청 유저의 지난 달 월별 지출
		const currentUserLastMonthlyExpense = await this.monthlyExpensesService.findOne({
			year: lastMonthYear,
			month: lastMonth,
			user: { id: user.id },
		});
		if (!currentUserLastMonthlyExpense) {
			throw new UnprocessableEntityException(
				`지난 달 월별 ${ExpenseException.NOT_FOUND} ${ExpenseException.CANNOT_MAKE_STATS}`,
			);
		}

		// 요청 유저의 이번 달 월별 지출
		const currentUserThisMonthlyExpense = await this.monthlyExpensesService.findOne({
			year,
			month,
			user: { id: user.id },
		});
		if (!currentUserThisMonthlyExpense) {
			throw new UnprocessableEntityException(
				`이번 달 월별 ${ExpenseException.NOT_FOUND}, ${ExpenseException.CANNOT_MAKE_STATS}`,
			);
		}

		// 지난 달 오늘까지의 각 카테고리별 지출 합계, 이번 달 오늘 날짜까지의 각 카테고리별 지출 합계
		const lastMonthlyExpensesAmountSums = await this.categoryExpensesService.getAmountSumsUntilDate(
			day,
			currentUserLastMonthlyExpense.id,
		);
		const thisMonthlyExpensesAmountSums = await this.categoryExpensesService.getAmountSumsUntilDate(
			day,
			currentUserThisMonthlyExpense.id,
		);

		// 지난 달 대비 총액 소비율, 카테고리별 소비율 계산
		const totalConsumptionRatioCompareToLastMonth = this.getTotalAmountConsumptionRatio(
			lastMonthlyExpensesAmountSums,
			thisMonthlyExpensesAmountSums,
		);
		const categoryConsumptionRatioCompareToLastMonth = this.getCategoryAmountConsumptionRatio(
			lastMonthlyExpensesAmountSums,
			thisMonthlyExpensesAmountSums,
		);

		const { month: lastWeekMonth, day: lastWeekDay } = getLastWeekDate({ year, month, day });

		// 일주일 전의 각 카테고리별 지출 합계, 오늘의 각 카테고리별 지출 합계
		const lastWeeklyExpensesAmountSums = await this.categoryExpensesService.getAmountSumsAtDate(
			lastWeekDay,
			lastWeekMonth === month ? currentUserThisMonthlyExpense.id : currentUserLastMonthlyExpense.id,
		);
		const todayExpensesAmountSums = await this.categoryExpensesService.getAmountSumsAtDate(
			day,
			currentUserThisMonthlyExpense.id,
		);

		// 지난 주 대비 총액 소비율, 카테고리별 소비율 계산
		const totalConsumptionRatioCompareToLastWeek = this.getTotalAmountConsumptionRatio(
			lastWeeklyExpensesAmountSums,
			todayExpensesAmountSums,
		);
		const categoryConsumptionRatioCompareToLastWeek = this.getCategoryAmountConsumptionRatio(
			lastWeeklyExpensesAmountSums,
			todayExpensesAmountSums,
		);

		// 이번 달 월별 예산과 월별 지출을 가지고 있는 랜덤 유저의 id 조회
		const randomUserId = await this.usersService.findRandomOneId(user.id, { year, month });

		// 랜덤 유저의 이번 달 월별 예산 대비 월별 지출 비율 조회
		const {
			monthlyExpenseId: randomUserThisMonthlyExpenseId,
			monthlyBudgetId: randomUserThisMonthlyBudgetId,
			ratio: randomUserTotalAmountRatio,
		} = await this.monthlyExpensesService.getTotalAmountConsumptionRatio(randomUserId, { year, month });

		// 요청 유저의 이번 달 월별 예산 대비 월별 지출 비율 조회
		const {
			monthlyExpenseId: currentUserThisMonthlyExpenseId,
			monthlyBudgetId: currentUserThisMonthlyBudgetId,
			ratio: currentUserTotalAmountRatio,
		} = await this.monthlyExpensesService.getTotalAmountConsumptionRatio(user.id, { year, month });

		// 랜덤 유저의 전체 지출 비율 대비 요청 유저의 전체 지출 비율의 소비율 계산
		// 		요청 유저의 지출 비율: 60%
		//		랜덤 유저의 지출 비율: 50%
		//		소비율: 60% / 50% * 100
		const totalConsumptionRatioCompareToRandomUser = this.calculateConsumptionRatio(
			currentUserTotalAmountRatio,
			randomUserTotalAmountRatio,
		);

		// 랜덤 유저의 이번 달 카테고리별 예산 대비 카테고리별 지출 비율 조회
		const randomUserCategoryConsumptionRatios = await this.categoryExpensesService.getCategoryConsumptionRatio(
			day,
			randomUserThisMonthlyExpenseId,
			randomUserThisMonthlyBudgetId,
		);

		// 요청 유저의 이번 달 카테고리별 예산 대비 카테고리별 지출 비율 조회
		const currentUserCategoryConsumptionRatios = await this.categoryExpensesService.getCategoryConsumptionRatio(
			day,
			currentUserThisMonthlyExpenseId,
			currentUserThisMonthlyBudgetId,
		);

		// 랜덤 유저의 카테고리별 지출 비율 대비 요청 유저의 카테고리별 지출 비율의 소비율 계산
		//		요청 유저의 카테고리별 지출 비율: 60%
		//		랜덤 유저의 카테고리별 지출 비율: 50%
		//		소비율: 60% / 50% * 100
		const categoryConsumptionRatioCompareToRandomUser: CategoryAndRatio[] = [];
		randomUserCategoryConsumptionRatios.forEach((randomUserCategoryConsumptionRatio) => {
			const category = randomUserCategoryConsumptionRatio.category;
			const randomUserRatio = randomUserCategoryConsumptionRatio.ratio;
			const { ratio: currentUserRatio } = currentUserCategoryConsumptionRatios.find(
				(value) => value.category === category,
			);
			const categoryConsumptionRatio = this.calculateConsumptionRatio(currentUserRatio, randomUserRatio);
			categoryConsumptionRatioCompareToRandomUser.push({ category, ratio: categoryConsumptionRatio });
		});

		return {
			lastMonth: {
				totalConsumptionRatio: totalConsumptionRatioCompareToLastMonth,
				categoryConsumptionRatio: categoryConsumptionRatioCompareToLastMonth,
			},
			lastWeek: {
				totalConsumptionRatio: totalConsumptionRatioCompareToLastWeek,
				categoryConsumptionRatio: categoryConsumptionRatioCompareToLastWeek,
			},
			otherUser: {
				totalConsumptionRatio: totalConsumptionRatioCompareToRandomUser,
				categoryConsumptionRatio: categoryConsumptionRatioCompareToRandomUser,
			},
		};
	}

	getTotalAmountConsumptionRatio(
		lastExpensesAmountSums: CategoryAndSum[],
		currentExpensesAmountSums: CategoryAndSum[],
	): number | null {
		const currentExpensesTotalAmount = currentExpensesAmountSums.reduce((prev, curr) => (prev += curr.sum), 0);
		const lastExpensesTotalAmount = lastExpensesAmountSums.reduce((prev, curr) => (prev += curr.sum), 0);
		const ratio = this.calculateConsumptionRatio(currentExpensesTotalAmount, lastExpensesTotalAmount);
		return ratio;
	}

	getCategoryAmountConsumptionRatio(
		lastExpensesAmountSums: CategoryAndSum[],
		currentExpensesAmountSums: CategoryAndSum[],
	): CategoryAndRatio[] {
		const categoryNames = Object.values(CategoryName);
		const currentCategoryAmountSums = {};
		const lastCategoryAmountSums = {};
		const categoryAmountConsumptionRatios: CategoryAndRatio[] = [];

		categoryNames.forEach((category) => {
			currentCategoryAmountSums[category] = 0;
			lastCategoryAmountSums[category] = 0;
		});

		currentExpensesAmountSums.forEach(
			(categoryAndSum) => (currentCategoryAmountSums[categoryAndSum.category] = categoryAndSum.sum),
		);
		lastExpensesAmountSums.forEach(
			(categoryAndSum) => (lastCategoryAmountSums[categoryAndSum.category] = categoryAndSum.sum),
		);

		for (const category in currentCategoryAmountSums) {
			const currentCategoryAmountSum = currentCategoryAmountSums[category];
			const lastCategoryAmountSum = lastCategoryAmountSums[category];
			const ratio = this.calculateConsumptionRatio(currentCategoryAmountSum, lastCategoryAmountSum);

			categoryAmountConsumptionRatios.push({
				category,
				ratio,
			});
		}

		return categoryAmountConsumptionRatios;
	}

	calculateConsumptionRatio(numerator: number, denominator: number): number | null {
		return denominator !== 0 ? Math.round((numerator / denominator) * 100) : null;
	}
}
