import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { MonthlyBudgetsModule } from 'src/monthly-budgets';
import { CategoryBudgetsModule } from 'src/category-budgets';
import { CategoriesModule } from 'src/categories';

@Module({
	imports: [MonthlyBudgetsModule, CategoryBudgetsModule, CategoriesModule],
	controllers: [BudgetsController],
	providers: [BudgetsService],
})
export class BudgetsModule {}
