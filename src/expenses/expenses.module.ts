import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MonthlyExpensesModule } from 'src/monthly-expenses';
import { CategoryExpensesModule } from 'src/category-expenses';
import { CategoriesModule } from 'src/categories';
import { MonthlyBudgetsModule } from 'src/monthly-budgets';

@Module({
	imports: [MonthlyExpensesModule, CategoryExpensesModule, CategoriesModule, MonthlyBudgetsModule],
	controllers: [ExpensesController],
	providers: [ExpensesService],
})
export class ExpensesModule {}
