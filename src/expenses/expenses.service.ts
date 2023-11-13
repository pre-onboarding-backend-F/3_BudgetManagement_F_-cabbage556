import { Injectable } from '@nestjs/common';
import { CategoryExpense, CategoryExpensesService } from 'src/category-expenses';
import { MonthlyExpense, MonthlyExpensesService } from 'src/monthly-expenses';
import { CreateExpenseDto } from './dto';
import { User } from 'src/users';
import { YearMonthDay, getDate } from 'src/global';
import { CategoriesService } from 'src/categories';

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
		oldMonthlyExpense: MonthlyExpense,
		partialDto: Partial<Omit<CreateExpenseDto, 'yyyyMMDD'>>,
	) {
		const { amount } = partialDto;

		// 월별 지출 전체 금액 업데이트
		oldMonthlyExpense.totalAmount += amount;
		const monthlyExpense = await this.monthlyExpensesService.saveOne(oldMonthlyExpense);

		return monthlyExpense;
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
}
