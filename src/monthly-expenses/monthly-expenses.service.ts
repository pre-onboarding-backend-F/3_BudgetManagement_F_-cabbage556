import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MonthlyExpense } from './entity';
import { Repository } from 'typeorm';

@Injectable()
export class MonthlyExpensesService {
	constructor(
		@InjectRepository(MonthlyExpense)
		private readonly monthlyExpensesRepository: Repository<MonthlyExpense>, //
	) {}
}
