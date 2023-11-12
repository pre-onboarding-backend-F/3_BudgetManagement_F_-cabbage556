import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MonthlyExpensesModule } from 'src/monthly-expenses';
import { CategoryExpensesModule } from 'src/category-expenses';

@Module({
	imports: [MonthlyExpensesModule, CategoryExpensesModule],
	controllers: [ExpensesController],
	providers: [ExpensesService],
})
export class ExpensesModule {}
