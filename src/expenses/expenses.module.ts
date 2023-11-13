import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MonthlyExpensesModule } from 'src/monthly-expenses';
import { CategoryExpensesModule } from 'src/category-expenses';
import { CategoriesModule } from 'src/categories';

@Module({
	imports: [MonthlyExpensesModule, CategoryExpensesModule, CategoriesModule],
	controllers: [ExpensesController],
	providers: [ExpensesService],
})
export class ExpensesModule {}
