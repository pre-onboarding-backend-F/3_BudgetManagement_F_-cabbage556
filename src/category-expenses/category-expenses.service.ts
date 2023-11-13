import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryExpense } from './entity';
import { Repository } from 'typeorm';

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
}
