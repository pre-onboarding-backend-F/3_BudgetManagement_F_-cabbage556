import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBudget } from './entity';

@Injectable()
export class MonthlyBudgetsService {
	constructor(
		@InjectRepository(MonthlyBudget)
		private readonly monthlyBudgetsRepository: Repository<MonthlyBudget>, //
	) {}
}
