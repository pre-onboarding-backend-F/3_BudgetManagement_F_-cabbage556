import { Injectable } from '@nestjs/common';
import { CategoryBudgetsService } from 'src/category-budgets';
import { MonthlyBudgetsService } from 'src/monthly-budgets';

@Injectable()
export class BudgetsService {
	constructor(
		private readonly monthlyBudgetsService: MonthlyBudgetsService,
		private readonly categoryBudgetsService: CategoryBudgetsService,
	) {}
}
