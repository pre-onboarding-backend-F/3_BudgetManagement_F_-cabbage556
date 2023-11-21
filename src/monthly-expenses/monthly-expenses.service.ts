import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyExpense } from './entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { GetExpensesQueryDto } from 'src/expenses';
import { User } from 'src/users';
import { Ratio, YearMonthDay } from 'src/global';

@Injectable()
export class MonthlyExpensesService {
	constructor(
		@InjectRepository(MonthlyExpense)
		private readonly monthlyExpensesRepository: Repository<MonthlyExpense>, //
	) {}

	async exists(where: FindOptionsWhere<MonthlyExpense>): Promise<boolean> {
		return await this.monthlyExpensesRepository.exist({ where });
	}

	async findOne(
		where: FindOptionsWhere<MonthlyExpense>,
		relations?: FindOptionsRelations<MonthlyExpense>,
	): Promise<MonthlyExpense> {
		return await this.monthlyExpensesRepository.findOne({ where, relations });
	}

	createOne({ year, month, totalAmount, user }: Partial<MonthlyExpense>): MonthlyExpense {
		return this.monthlyExpensesRepository.create({ year, month, totalAmount, user });
	}

	async saveOne(monthlyExpense: MonthlyExpense): Promise<MonthlyExpense> {
		return await this.monthlyExpensesRepository.save(monthlyExpense);
	}

	async findMonthlyExpenses(
		startDate: Omit<YearMonthDay, 'day'>,
		endDate: Omit<YearMonthDay, 'day'>,
		partialDto: Partial<GetExpensesQueryDto>,
		user: User,
	) {
		const { year: startYear, month: startMonth } = startDate;
		const { year: endYear, month: endMonth } = endDate;
		const { category, minAmount, maxAmount } = partialDto;

		const qb = this.monthlyExpensesRepository.createQueryBuilder('monthly_expense');

		// 요청한 유저의 조회 기간(시작 날짜와 종료 날짜 사이)의 월별 지출과 카테고리별 지출 조회
		qb.leftJoinAndSelect('monthly_expense.categoryExpenses', 'category_expense')
			.leftJoinAndSelect('category_expense.category', 'category')
			.where('monthly_expense.user = :userId', { userId: user.id })
			.andWhere('monthly_expense.year BETWEEN :startYear AND :endYear', { startYear, endYear }) //
			.andWhere('monthly_expense.month BETWEEN :startMonth AND :endMonth', { startMonth, endMonth });

		// 카테고리로 조회하는 경우 카테고리 조건 추가
		if (category) {
			qb.andWhere('category.name = :category', { category });
		}

		// 최소 금액과 최대 금액으로 조회하는 경우 금액 범위 조건 추가
		if (minAmount) {
			qb.andWhere('category_expense.amount >= :minAmount', { minAmount });
		}
		if (maxAmount) {
			qb.andWhere('category_expense.amount <= :maxAmount', { maxAmount });
		}

		return await qb.getMany();
	}

	async getTotalAmountConsumptionRatio(userId: string, { year, month }: Omit<YearMonthDay, 'day'>): Promise<number> {
		const [{ ratio }] = (await this.monthlyExpensesRepository.query(`
			SELECT
					round(me.total_amount::numeric / mb.total_amount::numeric * 100)::int as ratio
			FROM
					monthly_expense me,
					(
							SELECT
									mb.total_amount
							FROM
									monthly_budget mb
							WHERE
									mb.year = ${year}
									AND mb.month = ${month}
									AND mb.user_id = '${userId}'
					) as mb
			WHERE
					me.year = ${year}
					AND me.month = ${month}
					AND me.user_id = '${userId}'
		`)) as Ratio[];
		return ratio;
	}
}
