import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyExpense } from './entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class MonthlyExpensesService {
	constructor(
		@InjectRepository(MonthlyExpense)
		private readonly monthlyExpensesRepository: Repository<MonthlyExpense>, //
	) {}

	async findOne(where: FindOptionsWhere<MonthlyExpense>): Promise<MonthlyExpense> {
		return await this.monthlyExpensesRepository.findOne({ where });
	}

	createOne({ year, month, totalAmount, user }: Partial<MonthlyExpense>): MonthlyExpense {
		return this.monthlyExpensesRepository.create({ year, month, totalAmount, user });
	}

	async saveOne(monthlyExpense: MonthlyExpense): Promise<MonthlyExpense> {
		return await this.monthlyExpensesRepository.save(monthlyExpense);
	}
}
