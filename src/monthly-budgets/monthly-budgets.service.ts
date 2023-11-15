import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { MonthlyBudget } from './entity';

@Injectable()
export class MonthlyBudgetsService {
	constructor(
		@InjectRepository(MonthlyBudget)
		private readonly monthlyBudgetsRepository: Repository<MonthlyBudget>, //
	) {}

	async findOne(
		where: FindOptionsWhere<MonthlyBudget>,
		relations?: FindOptionsRelations<MonthlyBudget>,
	): Promise<MonthlyBudget> {
		return await this.monthlyBudgetsRepository.findOne({ where, relations });
	}

	createOne({ year, month, totalAmount, user }: Partial<MonthlyBudget>): MonthlyBudget {
		return this.monthlyBudgetsRepository.create({ year, month, totalAmount, user });
	}

	async saveOne(monthlyBudget: MonthlyBudget): Promise<MonthlyBudget> {
		return await this.monthlyBudgetsRepository.save(monthlyBudget);
	}
}
