import { Injectable } from '@nestjs/common';
import { CategoryExpensesService } from 'src/category-expenses';
import { MonthlyExpensesService } from 'src/monthly-expenses';

@Injectable()
export class ExpensesService {
	constructor(
		private readonly monthlyExpensesService: MonthlyExpensesService,
		private readonly categoryExpensesService: CategoryExpensesService,
	) {}
}
