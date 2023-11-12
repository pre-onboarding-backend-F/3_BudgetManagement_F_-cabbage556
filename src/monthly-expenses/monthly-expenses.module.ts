import { Module } from '@nestjs/common';
import { MonthlyExpensesService } from './monthly-expenses.service';

@Module({
	providers: [MonthlyExpensesService],
	exports: [MonthlyExpensesService],
})
export class MonthlyExpensesModule {}
