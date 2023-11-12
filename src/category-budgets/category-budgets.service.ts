import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryBudget } from './entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class CategoryBudgetsService {
	constructor(
		@InjectRepository(CategoryBudget)
		private readonly categoryBudgetsRepository: Repository<CategoryBudget>, //
	) {}

	async findMany(where: FindOptionsWhere<CategoryBudget>): Promise<CategoryBudget[]> {
		return await this.categoryBudgetsRepository.find({
			where,
			relations: {
				category: true,
			},
		});
	}

	createOne({ amount, category, monthlyBudget }: Partial<CategoryBudget>): CategoryBudget {
		return this.categoryBudgetsRepository.create({ amount, category, monthlyBudget });
	}

	async saveMany(categoryBudgets: CategoryBudget[]): Promise<CategoryBudget[]> {
		return await this.categoryBudgetsRepository.save(categoryBudgets);
	}
}
