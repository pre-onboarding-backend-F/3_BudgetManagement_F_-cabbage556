import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyExpense } from './entity';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';

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
}
