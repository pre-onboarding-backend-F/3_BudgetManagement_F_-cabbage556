import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryExpense } from './entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { QueryPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

	async updateOne(id: string, partialCategoryExpense: QueryPartialEntity<CategoryExpense>) {
		await this.categoryExpensesRepository.update({ id }, partialCategoryExpense);
	}

	async softDeleteOne(where: FindOptionsWhere<CategoryExpense>) {
		await this.categoryExpensesRepository.softDelete(where);
	}
}
