import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryExpense } from './entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { CategoryAndSum } from 'src/global';

@Injectable()
export class CategoryExpensesService {
	constructor(
		@InjectRepository(CategoryExpense)
		private readonly categoryExpensesRepository: Repository<CategoryExpense>, //
	) {}

	createOne({
		date,
		memo,
		amount,
		excludingInTotal,
		monthlyExpense,
		category,
	}: Partial<CategoryExpense>): CategoryExpense {
		return this.categoryExpensesRepository.create({
			date,
			memo,
			amount,
			excludingInTotal,
			monthlyExpense,
			category,
		});
	}

	async saveOne(categoryExpense: CategoryExpense): Promise<CategoryExpense> {
		return await this.categoryExpensesRepository.save(categoryExpense);
	}

	async exists(where: FindOptionsWhere<CategoryExpense>): Promise<boolean> {
		return await this.categoryExpensesRepository.exist({ where });
	}

	async findOne(
		where: FindOptionsWhere<CategoryExpense>,
		relations?: FindOptionsRelations<CategoryExpense>,
	): Promise<CategoryExpense> {
		return await this.categoryExpensesRepository.findOne({ where, relations });
	}

	async getAmountSumsUntilDate(date: number, monthlyExpenseId: string): Promise<CategoryAndSum[]> {
		const categoryAmountSums = (await this.categoryExpensesRepository.query(
			`SELECT
					category.name as category,
					SUM(amount)::int as sum
			FROM
					category_expense
			LEFT JOIN
					category on category_id = category.id
			WHERE
					monthly_expense_id = '${monthlyExpenseId}'
					AND date <= ${date}
					AND excluding_in_total = false
			GROUP BY
					category.name`,
		)) as CategoryAndSum[];
		return categoryAmountSums;
	}

	async getAmountSumsAtDate(date: number, monthlyExpenseId: string): Promise<CategoryAndSum[]> {
		const categoryAmountSums = (await this.categoryExpensesRepository.query(
			`SELECT
					category.name as category,
					SUM(amount)::int as sum
			FROM
					category_expense
			LEFT JOIN
					category on category_id = category.id
			WHERE
					monthly_expense_id = '${monthlyExpenseId}'
					AND date = ${date}
					AND excluding_in_total = false
			GROUP BY
					category.name`,
		)) as CategoryAndSum[];
		return categoryAmountSums;
	}

	async updateOne(id: string, partialCategoryExpense: QueryPartialEntity<CategoryExpense>) {
		await this.categoryExpensesRepository.update({ id }, partialCategoryExpense);
	}

	async softDeleteOne(where: FindOptionsWhere<CategoryExpense>) {
		await this.categoryExpensesRepository.softDelete(where);
	}
}
