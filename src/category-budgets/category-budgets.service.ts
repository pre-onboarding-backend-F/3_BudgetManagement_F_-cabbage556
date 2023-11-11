import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryBudget } from './entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryBudgetsService {
	constructor(
		@InjectRepository(CategoryBudget)
		private readonly categoryBudgetsRepository: Repository<CategoryBudget>, //
	) {}
}
