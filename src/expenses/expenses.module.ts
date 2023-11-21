import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MonthlyExpensesModule } from 'src/monthly-expenses';
import { CategoryExpensesModule } from 'src/category-expenses';
import { CategoriesModule } from 'src/categories';
import { MonthlyBudgetsModule } from 'src/monthly-budgets';
import { StatsService } from './stats.service';
import { UsersModule } from 'src/users';
import { CategoryBudgetsModule } from 'src/category-budgets';

@Module({
	imports: [
		MonthlyExpensesModule,
		CategoryExpensesModule,
		CategoriesModule,
		MonthlyBudgetsModule,
		CategoryBudgetsModule,
		UsersModule,
	],
	controllers: [ExpensesController],
	providers: [ExpensesService, StatsService],
})
export class ExpensesModule {}
