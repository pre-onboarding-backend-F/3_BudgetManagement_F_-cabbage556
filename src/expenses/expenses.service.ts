import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { CategoryExpense, CategoryExpensesService } from 'src/category-expenses';
import { MonthlyExpense, MonthlyExpensesService } from 'src/monthly-expenses';
import { CreateExpenseDto, GetExpensesQueryDto, UpdateExpenseDto } from './dto';
import { User } from 'src/users';
import { YearMonthDay, getDate, getToday } from 'src/global';
import { CategoriesService } from 'src/categories';
import { ExpenseException, RecommendMessage } from './enums';
import { MonthlyBudgetsService } from 'src/monthly-budgets';
import { MonthTotalAmount } from './interfaces/month-total-amount';
import { CategoryTotalAmount } from './interfaces/category-total-amount';
import { ExpenseSummary } from './interfaces/expense-summary';
import { CategoryExpenseSummary } from './interfaces/category-expense-summary';
import { CategoryProperAmount } from './interfaces/category-proper-amount';

@Injectable()
export class ExpensesService {
	constructor(
		private readonly monthlyExpensesService: MonthlyExpensesService,
		private readonly categoryExpensesService: CategoryExpensesService,
		private readonly categoriesService: CategoriesService,
		private readonly monthlyBudgetsService: MonthlyBudgetsService,
	) {}

	async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
		const { yyyyMmDd, category: name, amount, memo, exclude: excludingInTotal } = createExpenseDto;
		const { year, month, day: date } = getDate(yyyyMmDd);

		let monthlyExpense = await this.monthlyExpensesService.findOne({ year, month, user: { id: user.id } });
		if (monthlyExpense) {
			monthlyExpense.totalAmount += excludingInTotal ? 0 : amount;
			monthlyExpense = await this.monthlyExpensesService.saveOne(monthlyExpense);
		} else {
			const totalAmount = excludingInTotal ? 0 : amount;
			const createdMonthlyExpense = this.monthlyExpensesService.createOne({ year, month, totalAmount, user });
			monthlyExpense = await this.monthlyExpensesService.saveOne(createdMonthlyExpense);
		}

		// 카테고리별 지출 생성 후 저장
		const category = await this.categoriesService.findOne({ name });
		const createdCategoryExpense = this.categoryExpensesService.createOne({
			category,
			amount,
			memo,
			excludingInTotal,
			date,
			monthlyExpense,
		});
		const categoryExpense = await this.categoryExpensesService.saveOne(createdCategoryExpense);

		delete monthlyExpense.user;
		delete categoryExpense.monthlyExpense;

		return {
			monthlyExpense,
			categoryExpense,
		};
	}

	// 월별 지출 전체 금액 업데이트
	async updateMonthlyExpenseTotalAmount(
		monthlyExpense: MonthlyExpense,
		partialDto: Partial<Omit<CreateExpenseDto, 'yyyyMMDD'>>,
	) {
		const { amount } = partialDto;

		// 월별 지출 전체 금액 업데이트
		monthlyExpense.totalAmount += amount;

		return await this.monthlyExpensesService.saveOne(monthlyExpense);
	}

	async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, user: User) {
		const categoryExpense = await this.categoryExpensesService.findOne(
			{ id },
			{
				monthlyExpense: {
					user: true,
				},
				category: true,
			},
		);
		if (!categoryExpense) {
			throw new NotFoundException(ExpenseException.NOT_FOUND);
		}

		// 요청한 유저의 월별 지출이 아니라면 수정할 수 없으므로 Unauthorized 예외를 던짐
		const userIdMatched = categoryExpense.monthlyExpense.user.id === user.id;
		if (!userIdMatched) {
			throw new UnauthorizedException(ExpenseException.CANNOT_UPDATE_OTHERS);
		}

		const { yyyyMmDd, category: categoryName, amount, memo, exclude: excludingInTotal } = updateExpenseDto;
		const { year, month, day: date } = getDate(yyyyMmDd);

		// 수정할 날짜로 전달한 year, month가 월별 지출의 year, month와 일치하지 않는 경우 업데이트할 수 없으므로 BadRequest 예외를 던짐
		// year, month가 월별 지출의 year, month와 일치하지 않는 경우라면 지출 기록을 새롭게 생성해야 함
		const yearMonthMatched = this.checkYearMonthMatched(categoryExpense.monthlyExpense, { year, month });
		if (!yearMonthMatched) {
			throw new BadRequestException(ExpenseException.YEAR_MONTH_NOT_MATCHED);
		}

		// 수정할 필요가 없다면 수정하지 않음
		const valuesMatched = this.checkValuesMatched(categoryExpense, {
			day: date,
			category: categoryName,
			amount,
			memo,
			exclude: excludingInTotal,
		});
		if (valuesMatched) {
			return;
		}

		// 이전 카테고리와 다른 경우 카테고리 업데이트
		let category = categoryExpense.category;
		if (categoryExpense.category.name !== categoryName) {
			category = await this.categoriesService.findOne({ name: categoryName });
		}
		await this.categoryExpensesService.updateOne(categoryExpense.id, {
			date,
			amount,
			memo,
			excludingInTotal,
			category,
		});

		delete categoryExpense.monthlyExpense.user;

		// dto의 지출 합계제외 여부: true / 기존의 지출 합계제외 여부: true
		// 월별 지출 전체 금액을 업데이트하지 않음
		if (excludingInTotal && categoryExpense.excludingInTotal) {
			return {
				monthlyExpense: categoryExpense.monthlyExpense,
				categoryExpense: await this.categoryExpensesService.findOne(
					{ id: categoryExpense.id },
					{ category: true },
				),
			};
		}

		// dto의 지출 합계제외 여부: true / 기존의 지출 합계제외 여부: false
		// 월별 지출 전체 금액 업데이트: 기존의 지출 금액만큼 차감
		if (excludingInTotal && !categoryExpense.excludingInTotal) {
			return {
				monthlyExpense: await this.updateMonthlyExpenseTotalAmount(
					categoryExpense.monthlyExpense, //
					{ amount: -categoryExpense.amount },
				),
				categoryExpense: await this.categoryExpensesService.findOne(
					{ id: categoryExpense.id },
					{ category: true },
				),
			};
		}

		// dto의 지출 합계제외 여부: false / 기존의 지출 합계제외 여부: true
		// 월별 지출 전체 금액 업데이트: dto의 지출 금액만큼 합산
		if (!excludingInTotal && categoryExpense.excludingInTotal) {
			return {
				monthlyExpense: await this.updateMonthlyExpenseTotalAmount(
					categoryExpense.monthlyExpense, //
					{ amount },
				),
				categoryExpense: await this.categoryExpensesService.findOne(
					{ id: categoryExpense.id },
					{ category: true },
				),
			};
		}

		// dto의 지출 합계제외 여부: false  / 기존의 지출 합계제외 여부: false
		// 월별 지출 전체 금액 업데이트: dto의 지출 금액 - 기존의 지출 금액만큼 합산
		const amountDifference = amount - categoryExpense.amount;

		return {
			monthlyExpense: await this.updateMonthlyExpenseTotalAmount(
				categoryExpense.monthlyExpense, //
				{ amount: amountDifference },
			),
			categoryExpense: await this.categoryExpensesService.findOne(
				{ id: categoryExpense.id }, //
				{ category: true },
			),
		};
	}

	checkYearMonthMatched(monthlyExpense: MonthlyExpense, yearMonth: Omit<YearMonthDay, 'day'>): boolean {
		const yearMatched = monthlyExpense.year === yearMonth.year;
		const monthMatched = monthlyExpense.month === yearMonth.month;
		return yearMatched && monthMatched;
	}

	checkValuesMatched(
		categoryExpense: CategoryExpense,
		values: Pick<YearMonthDay, 'day'> & Omit<UpdateExpenseDto, 'yyyyMmDd'>,
	): boolean {
		const { day: date, category: categoryName, amount, memo, exclude: excludingInTotal } = values;
		const dateMatched = categoryExpense.date === date;
		const categoryNameMatched = categoryExpense.category.name === categoryName;
		const amountMatched = categoryExpense.amount === amount;
		const memoMatched = categoryExpense.memo === memo;
		const excludingInTotalMatched = categoryExpense.excludingInTotal === excludingInTotal;

		return dateMatched && categoryNameMatched && amountMatched && memoMatched && excludingInTotalMatched;
	}

	async deleteExpense(id: string, user: User) {
		const categoryExpense = await this.categoryExpensesService.findOne({ id }, { monthlyExpense: { user: true } });
		if (!categoryExpense) {
			throw new NotFoundException(ExpenseException.NOT_FOUND);
		}

		const userIdMatched = categoryExpense.monthlyExpense.user.id === user.id;
		if (!userIdMatched) {
			throw new UnauthorizedException(ExpenseException.CANNOT_DELETE_OTHERS);
		}

		// 카테고리별 지출 삭제
		await this.categoryExpensesService.softDeleteOne({ id });

		// 지출 합계제외 여부가 false인 경우 월별 지출 전체 금액 업데이트
		if (!categoryExpense.excludingInTotal) {
			categoryExpense.monthlyExpense.totalAmount -= categoryExpense.amount;
			await this.monthlyExpensesService.saveOne(categoryExpense.monthlyExpense);
		}
	}

	async getExpense(id: string, user: User) {
		const categoryExpense = await this.categoryExpensesService.findOne(
			{ id },
			{ monthlyExpense: { user: true }, category: true },
		);
		if (!categoryExpense) {
			throw new NotFoundException(ExpenseException.NOT_FOUND);
		}

		const userIdMatched = categoryExpense.monthlyExpense.user.id === user.id;
		if (!userIdMatched) {
			throw new UnauthorizedException(ExpenseException.CANNOT_GET_OTHERS);
		}

		delete categoryExpense.monthlyExpense.user;

		return categoryExpense;
	}

	async getExpenses(getExpensesQueryDto: GetExpensesQueryDto, user: User) {
		const { startDate, endDate, category, minAmount, maxAmount } = getExpensesQueryDto;
		const { year: startYear, month: startMonth, day: startDay } = getDate(startDate);
		const { year: endYear, month: endMonth, day: endDay } = getDate(endDate);

		// 시작 년도와 종료 년도, 시작 월과 종료 월 사이에 존재하는 월별 지출 조회
		const monthlyExpenses = await this.monthlyExpensesService.findMonthlyExpenses(
			{ year: startYear, month: startMonth },
			{ year: endYear, month: endMonth },
			{ category, minAmount, maxAmount },
			user,
		);

		// 시작 일과 종료 일 범위 바깥에 있는 카테고리별 지출 필터링
		monthlyExpenses.forEach(
			this.filterOutsideDateRange({ month: startMonth, day: startDay }, { month: endMonth, day: endDay }),
		);

		// 월별 지출 합계 계산
		const monthlySum = new Map<string, number>(); // 조회 기간 동안의 월별 지출 합계 { '2023-11': 11월 지출 금액, '2023-12': 12월 지출 금액, ... }
		monthlyExpenses.forEach(this.caculateMonthlySums(monthlySum));

		// 월별 지출 합계 응답 생성
		const monthlySums: MonthTotalAmount[] = [];
		monthlySum.forEach((totalAmount, month) => monthlySums.push({ month, totalAmount }));

		// 각 카테고리별 지출의 합계 계산
		const categorySum = new Map<string, number>(); // 조회 기간 동안의 각 카테고리별 지출 합계 { '음식': 200000, '교통': 200000, ... }
		monthlyExpenses.forEach(this.calculateCategorySums(categorySum));

		// 카테고리별 지출 합계 응답 생성
		const categorySums: CategoryTotalAmount[] = [];
		categorySum.forEach((totalAmount, category) => categorySums.push({ category, totalAmount }));

		// 지출 기록, 월별 지출 합계, 각 카테고리별 지출 합계 리턴
		return {
			expenses: monthlyExpenses,
			sums: {
				months: monthlySums,
				categories: categorySums,
			},
		};
	}

	filterOutsideDateRange(startDate: Omit<YearMonthDay, 'year'>, endDate: Omit<YearMonthDay, 'year'>) {
		const { month: startMonth, day: startDay } = startDate;
		const { month: endMonth, day: endDay } = endDate;

		return (monthlyExpense: MonthlyExpense) => {
			const equalToStartMonth = monthlyExpense.month === startMonth;
			const equalToEndMonth = monthlyExpense.month === endMonth;

			const categoryExpensesBetweenDates = monthlyExpense.categoryExpenses.filter((categoryExpense) => {
				// 시작 월의 경우 startDay보다 작은 날짜는 필터링
				const beforeStartDay = categoryExpense.date < startDay;
				if (equalToStartMonth && beforeStartDay) {
					return false;
				}

				// 종료 월의 경우 endDay보다 큰 날짜는 필터링
				const afterEndDay = categoryExpense.date > endDay;
				if (equalToEndMonth && afterEndDay) {
					return false;
				}

				return true;
			});

			monthlyExpense.categoryExpenses = categoryExpensesBetweenDates;
		};
	}

	caculateMonthlySums(monthlySums: Map<string, number>) {
		return (monthlyExpense: MonthlyExpense) => {
			// 응답에서 월별 지출 전체 금액 제거
			delete monthlyExpense.totalAmount;

			// 월별 지출 합계 키: 'yyyy-mm'
			const yearMonth = `${monthlyExpense.year}-${monthlyExpense.month}`;

			// 월별 지출 합계 계산
			monthlyExpense.categoryExpenses.forEach((categoryExpense) => {
				let monthlySum = monthlySums.get(yearMonth) ?? 0;

				// 지출 합계제외 여부가 true이면 합계 계산 시 제외
				if (!categoryExpense.excludingInTotal) {
					monthlySum += categoryExpense.amount;
				}

				monthlySums.set(yearMonth, monthlySum);
			});
		};
	}

	calculateCategorySums(categorySums: Map<string, number>) {
		return (monthlyExpense: MonthlyExpense) => {
			monthlyExpense.categoryExpenses.forEach((categoryExpense) => {
				// 카테고리별 지출 합계 키: 카테고리 이름
				const categoryName = categoryExpense.category.name;
				let categorySum = categorySums.get(categoryName) ?? 0;

				// 지출 합계제외 여부가 true이면 합계 계산 시 제외
				if (!categoryExpense.excludingInTotal) {
					categorySum += categoryExpense.amount;
				}

				if (categorySum !== 0) {
					categorySums.set(categoryName, categorySum);
				}
			});
		};
	}

	async getTodayExpensesSummary(user: User) {
		const { year, month, day } = getToday();

		// 오늘 기준 월별 예산
		const monthlyBudget = await this.monthlyBudgetsService.findOne(
			{ year, month, user: { id: user.id } },
			{ categoryBudgets: { category: true } },
		);
		if (!monthlyBudget) {
			throw new UnprocessableEntityException(
				`이번 달 ${ExpenseException.BUDGET_NOT_FOUND} ${ExpenseException.CANNOT_MAKE_TODAY_SUMMARY}`,
			);
		}

		// 오늘 기준 월별 지출
		const monthlyExpense = await this.monthlyExpensesService.findOne(
			{ year, month, user: { id: user.id } },
			{ categoryExpenses: { category: true } },
		);
		if (!monthlyExpense) {
			throw new UnprocessableEntityException(
				`이번 달 ${ExpenseException.NOT_FOUND} ${ExpenseException.CANNOT_MAKE_TODAY_SUMMARY}`,
			);
		}

		// 오늘이 아닌 지출 기록은 필터링
		const todayExpenses = monthlyExpense.categoryExpenses.filter((categoryExpense) => categoryExpense.date === day);

		// 오늘 지출 금액 합계, 오늘 적정 지출 금액, 오늘 위험도 계산
		const todaySum = todayExpenses.reduce((acc, curr) => (acc += curr.excludingInTotal ? 0 : curr.amount), 0);
		const { properAmount: todayProperAmount, risk: todayRisk } = this.getProperAmountAndRisk(
			monthlyBudget.totalAmount,
			todaySum,
		);

		// 오늘 전체 지출 요약
		const todayTotalSummary: ExpenseSummary = {
			totalAmount: todaySum,
			properAmount: todayProperAmount,
			amountRisk: todayRisk,
		};

		// 카테고리별 지출 금액 합계 계산
		const todayCategorySums = new Map<string, number>();
		todayExpenses.forEach((todayExpense) => {
			const categoryName = todayExpense.category.name;

			let todayCategorySum = todayCategorySums.get(categoryName) ?? 0;
			if (!todayExpense.excludingInTotal) {
				todayCategorySum += todayExpense.amount;
			}
			if (todayCategorySum !== 0) {
				todayCategorySums.set(categoryName, todayCategorySum);
			}
		});

		// 카테고리별 지출 요약
		const todayCategorySummary: CategoryExpenseSummary[] = [];

		// 카테고리별 적정 지출 금액, 위험도 계산
		todayCategorySums.forEach((todayCategorySum, categoryName) => {
			// 카테고리별 지출 금액에 존재하는 카테고리에 해당하는 예산
			const categoryBudgetAmount = monthlyBudget.categoryBudgets.find(
				(categoryBudget) => categoryBudget.category.name === categoryName,
			).amount;
			// 카테고리별 적정 지출 금액, 위험도 계산
			const { properAmount: categoryProperAmount, risk: categoryRisk } = this.getProperAmountAndRisk(
				categoryBudgetAmount,
				todayCategorySum,
			);

			todayCategorySummary.push({
				category: categoryName,
				totalAmount: todayCategorySum,
				properAmount: categoryProperAmount,
				amountRisk: categoryRisk,
			});
		});

		return {
			todayTotalSummary,
			todayCategorySummary,
		};
	}

	getProperAmountAndRisk(budgetAmount: number, expenseAmount: number, day = 0) {
		const properAmount = Math.floor(budgetAmount / (30 - day) / 100) * 100;
		const risk = Math.floor((expenseAmount / properAmount) * 100);
		return {
			properAmount,
			risk,
		};
	}

	async getTodayExpensesRecommend(user: User) {
		const { year, month, day } = getToday();

		const monthlyBudget = await this.monthlyBudgetsService.findOne(
			{ year, month, user: { id: user.id } },
			{ categoryBudgets: { category: true } },
		);
		if (!monthlyBudget) {
			throw new UnprocessableEntityException(
				`이번 달 ${ExpenseException.BUDGET_NOT_FOUND} ${ExpenseException.CANNOT_MAKE_TODAY_RECOMMEND}`,
			);
		}

		const monthlyExpense = await this.monthlyExpensesService.findOne(
			{ year, month, user: { id: user.id } },
			{ categoryExpenses: { category: true } },
		);

		// 월별 예산 전체 금액에서 남은 금액이 없는지 확인
		const budgetLeft = monthlyBudget.totalAmount > (monthlyExpense?.totalAmount ?? -Infinity);

		// 월별 지출이 없는 경우(아직 지출 기록이 없는 경우) 또는 남은 금액이 없는 경우
		if (!monthlyExpense || !budgetLeft) {
			let recommendMessage = RecommendMessage.EXPEND_NOT_YET;
			let currentDate = day;

			if (!budgetLeft) {
				recommendMessage = RecommendMessage.OVER_BUDGET;
				currentDate = 0;
			}

			// 오늘 전체 지출 추천 계산
			//		월별 지출이 없는 경우: 월별 예산 전체 금액 / 월에서 남은 일수
			//		남은 금액이 없는 경우: 월별 예산 전체 금액 / 월의 전체 일수
			const { properAmount: todayProperAmount } = this.getProperAmountAndRisk(
				monthlyBudget.totalAmount,
				0,
				currentDate,
			);

			// 오늘 카테고리별 지출 추천
			const todayCategoryProperAmounts: CategoryProperAmount[] = [];
			monthlyBudget.categoryBudgets.forEach((categoryBudget) => {
				const categoryName = categoryBudget.category.name;
				const categoryBudgetAmount = categoryBudget.amount;

				// 오늘 카테고리별 지출 추천 계산
				// 		월별 지출이 없는 경우: 카테고리별 예산 금액 / 월에서 남은 일수
				//		남은 금액이 없는 경우: 카테고리별 예산 금액 / 월의 전체 일수
				const { properAmount: categoryProperAmount } = this.getProperAmountAndRisk(
					categoryBudgetAmount,
					0,
					currentDate,
				);

				// [ { category: '음식', properAmount: 10000 }, { category: '카페', properAmount: 3000}, ... ]
				todayCategoryProperAmounts.push({ category: categoryName, properAmount: categoryProperAmount });
			});

			return {
				recommendMessage,
				todayProperAmount,
				todayCategoryProperAmounts,
			};
		}

		// 월별 지출이 존재하고 남은 금액이 존재하는 경우
		// 오늘 전체 지출 추천 계산
		// 		월별 지출이 존재하는 경우: 월별 남은 금액 / 월에서 남은 일수
		const remainingTotalAmount = monthlyBudget.totalAmount - monthlyExpense.totalAmount;
		const { properAmount: todayProperAmount } = this.getProperAmountAndRisk(remainingTotalAmount, 0, day);

		// 카테고리별 지출 금액 합계 계산
		const categorySums = new Map<string, number>();
		monthlyExpense.categoryExpenses.forEach((categoryExpense) => {
			const categoryName = categoryExpense.category.name;

			let categorySum = categorySums.get(categoryName) ?? 0;
			if (!categoryExpense.excludingInTotal) {
				categorySum += categoryExpense.amount;
			}

			if (categorySum !== 0) {
				categorySums.set(categoryName, categorySum);
			}
		});

		// 오늘 카테고리별 지출 추천 계산
		const todayCategoryProperAmounts: CategoryProperAmount[] = [];
		monthlyBudget.categoryBudgets.forEach((categoryBudget) => {
			const categoryName = categoryBudget.category.name;

			// 카테고리에 해당하는 지출이 없는 경우 카테고리별 지출 금액을 0으로 설정
			const categoryExpenseAmount = categorySums.get(categoryName) ?? 0;

			let remainingCategoryAmount = categoryBudget.amount - categoryExpenseAmount;

			// 카테고리별 지출 금액이 카테고리별 예산 금액보다 큰 경우 0으로 설정
			remainingCategoryAmount = remainingCategoryAmount > 0 ? remainingCategoryAmount : 0;
			const { properAmount: categoryProperAmount } = this.getProperAmountAndRisk(remainingCategoryAmount, 0, day);

			todayCategoryProperAmounts.push({ category: categoryName, properAmount: categoryProperAmount });
		});

		// 추천 메세지 기준에 따라 추천 메세지 생성
		//		오늘까지의 적정 금액(하루 적정 금액 * 날짜(일))이 월별 지출 전체 금액보다 크면 GOOD
		//		오늘까지의 적정 금액이 월별 지출 전체 금액보다 작으면 BAD
		const { properAmount } = this.getProperAmountAndRisk(monthlyBudget.totalAmount, 0);
		const properAmountUpToNow = properAmount * day;
		const recommendMessage =
			properAmountUpToNow > monthlyExpense.totalAmount ? RecommendMessage.GOOD : RecommendMessage.BAD;

		return {
			recommendMessage,
			todayProperAmount,
			todayCategoryProperAmounts,
		};
	}
}
