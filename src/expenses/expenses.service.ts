import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CategoryExpense, CategoryExpensesService } from 'src/category-expenses';
import { MonthlyExpense, MonthlyExpensesService } from 'src/monthly-expenses';
import { CreateExpenseDto, GetExpensesQueryDto, UpdateExpenseDto } from './dto';
import { User } from 'src/users';
import { YearMonthDay, getDate } from 'src/global';
import { CategoriesService } from 'src/categories';
import { ExpenseException } from './enums';

@Injectable()
export class ExpensesService {
	constructor(
		private readonly monthlyExpensesService: MonthlyExpensesService,
		private readonly categoryExpensesService: CategoryExpensesService,
		private readonly categoriesService: CategoriesService, //
	) {}

	async createExpense(createExpenseDto: CreateExpenseDto, user: User) {
		const { yyyyMMDD, category, amount, memo, exclude } = createExpenseDto;
		const { year, month, day } = getDate(yyyyMMDD);

		const oldMonthlyExpense = await this.monthlyExpensesService.findOne({ year, month, user: { id: user.id } });
		// 월별 지출이 존재하는 경우 월별 지출 전체 금액 업데이트, 카테고리별 지출 생성 후 저장
		if (oldMonthlyExpense) {
			const monthlyBudget = await this.updateMonthlyExpenseTotalAmount(oldMonthlyExpense, { amount });
			const categoryExpense = await this.saveNewCategoryExpense({ day }, monthlyBudget, {
				amount,
				category,
				memo,
				exclude,
			});
			return {
				monthlyBudget,
				categoryExpense,
			};
		}
		// 월별 지출이 존재하지 않는 경우 월별 지출, 카테고리별 지출 생성 후 저장
		else {
			const monthlyExpense = await this.saveNewMonthlyExpense({ year, month }, { amount }, user);
			const categoryExpense = await this.saveNewCategoryExpense({ day }, monthlyExpense, {
				amount,
				category,
				memo,
				exclude,
			});

			return {
				monthlyExpense,
				categoryExpense,
			};
		}
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

	// 새로운 월별 지출 생성 후 저장
	async saveNewMonthlyExpense(
		yearMonthDay: Omit<YearMonthDay, 'day'>,
		partialDto: Partial<Omit<CreateExpenseDto, 'yyyyMMDD'>>,
		user: User,
	) {
		const { year, month } = yearMonthDay;
		const { amount: totalAmount } = partialDto;

		// 월별 지출 생성 후 저장
		const createdMonthlyExpense = this.monthlyExpensesService.createOne({ year, month, totalAmount, user });
		const monthlyExpense = await this.monthlyExpensesService.saveOne(createdMonthlyExpense);

		return monthlyExpense;
	}

	// 새로운 카테고리별 지출 생성 후 저장
	async saveNewCategoryExpense(
		yearMonthDay: Pick<YearMonthDay, 'day'>,
		monthlyExpense: MonthlyExpense,
		partialDto: Partial<Omit<CreateExpenseDto, 'yyyyMMDD'>>,
	): Promise<CategoryExpense> {
		const { day: date } = yearMonthDay;
		const { amount, category: name, memo, exclude: excludingInTotal } = partialDto;

		// 카테고리 조회
		const category = await this.categoriesService.findOne({ name });

		// 카테고리별 지출 생성 후 저장
		const createdCategoryExpense = this.categoryExpensesService.createOne({
			date,
			memo,
			amount,
			excludingInTotal,
			monthlyExpense,
			category,
		});
		const categoryExpense = await this.categoryExpensesService.saveOne(createdCategoryExpense);

		return categoryExpense;
	}

	async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto, user: User) {
		// id에 해당하는 카테고리별 지출을 찾을 수 없으면 NotFound 예외를 던짐
		const categoryExpenseExists = await this.categoryExpensesService.exists({ id });
		if (!categoryExpenseExists) {
			throw new NotFoundException(ExpenseException.NOT_FOUND);
		}

		const categoryExpense = await this.categoryExpensesService.findOne(
			{ id },
			{
				// 월별 지출, 유저 join
				monthlyExpense: {
					user: true,
				},
				// 카테고리 join
				category: true,
			},
		);

		// 요청한 유저의 월별 지출이 아니라면 수정할 수 없으므로 Unauthorized 예외를 던짐
		const userIdMatched = categoryExpense.monthlyExpense.user.id === user.id;
		if (!userIdMatched) {
			throw new UnauthorizedException(ExpenseException.CANNOT_UPDATE_OTHERS);
		}

		const { yyyyMMDD, category: categoryName, amount, memo, exclude: excludingInTotal } = updateExpenseDto;
		const { year, month, day: date } = getDate(yyyyMMDD);

		// 수정할 날짜로 전달한 year, month가 월별 지출의 year, month와 일치하지 않는 경우 업데이트할 수 없으므로 BadRequest 예외를 던짐
		// year, month가 월별 지출의 year, month와 일치하지 않는 경우라면 지출 기록을 새롭게 생성해야 함
		const yearMonthNotMatched = this.checkYearMonthNotMatched(categoryExpense.monthlyExpense, { year, month });
		if (yearMonthNotMatched) {
			throw new BadRequestException(ExpenseException.INVALID_YEAR_MONTH);
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
			return '수정할 값이 없습니다.';
		}

		// 카테고리별 지출 업데이트
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

		// 월별 지출 전체 금액 업데이트
		const amountDifference = amount - categoryExpense.amount;

		return {
			monthlyExpense: await this.updateMonthlyExpenseTotalAmount(categoryExpense.monthlyExpense, {
				amount: amountDifference,
			}),
			categoryExpense: await this.categoryExpensesService.findOne({ id: categoryExpense.id }, { category: true }),
		};
	}

	checkYearMonthNotMatched(monthlyExpense: MonthlyExpense, yearMonth: Omit<YearMonthDay, 'day'>): boolean {
		const yearNotMatched = monthlyExpense.year !== yearMonth.year;
		const monthNotMatched = monthlyExpense.month !== yearMonth.month;
		return yearNotMatched || monthNotMatched;
	}

	checkValuesMatched(
		categoryExpense: CategoryExpense,
		values: Pick<YearMonthDay, 'day'> & Omit<UpdateExpenseDto, 'yyyyMMDD'>,
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

		// 월별 지출 전체 금액 업데이트
		categoryExpense.monthlyExpense.totalAmount -= categoryExpense.amount;
		await this.monthlyExpensesService.saveOne(categoryExpense.monthlyExpense);
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
			throw new UnauthorizedException(ExpenseException.CANNT_GET_OTHERS);
		}

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
			this.filterOutsideDateRange2({ month: startMonth, day: startDay }, { month: endMonth, day: endDay }),
		);

		// 월별 지출 합계 계산
		const monthlySums = new Map<string, number>(); // 조회 기간 동안의 월별 지출 합계 { '2023-11': 11월 지출 금액, '2023-12': 12월 지출 금액, ... }
		monthlyExpenses.forEach(this.caculateMonthlySums2(monthlySums));

		// 각 카테고리별 지출의 합계 계산
		const categorySums = new Map<string, number>(); // 조회 기간 동안의 각 카테고리별 지출 합계 { '음식': 200000, '교통': 200000, ... }
		monthlyExpenses.forEach(this.calculateCategorySums2(categorySums));

		// 지출 기록, 월별 지출 합계, 각 카테고리별 지출 합계 리턴
		return {
			expenses: monthlyExpenses,
			sums: {
				months: monthlySums,
				category: categorySums,
			},
		};
	}

	filterOutsideDateRange(
		monthlyExpenses: MonthlyExpense[],
		startDate: Omit<YearMonthDay, 'year'>,
		endDate: Omit<YearMonthDay, 'year'>,
	) {
		const { month: startMonth, day: startDay } = startDate;
		const { month: endMonth, day: endDay } = endDate;

		// 시작 날짜와 종료 날짜 사이에 존재하는 카테고리별 지출만 월별 지출에 할당
		monthlyExpenses.forEach((monthlyExpense) => {
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
		});
	}

	filterOutsideDateRange2(startDate: Omit<YearMonthDay, 'year'>, endDate: Omit<YearMonthDay, 'year'>) {
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

	calculateMonthlySums(monthlyExpenses: MonthlyExpense[], monthlySums: Map<string, number>) {
		monthlyExpenses.forEach((monthlyExpense) => {
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
		});
	}

	caculateMonthlySums2(monthlySums: Map<string, number>) {
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

	calculateCategorySums(monthlyExpenses: MonthlyExpense[], categorySums: Map<string, number>) {
		// 카테고리별 지출 합계 계산
		monthlyExpenses.forEach((monthlyExpense) => {
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
		});
	}

	calculateCategorySums2(categorySums: Map<string, number>) {
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
}
