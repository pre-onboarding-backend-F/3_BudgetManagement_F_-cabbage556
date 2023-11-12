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
}
