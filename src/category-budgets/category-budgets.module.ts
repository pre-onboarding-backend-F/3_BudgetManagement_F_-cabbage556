import { Module } from '@nestjs/common';
import { CategoryBudgetsService } from './category-budgets.service';

@Module({
	providers: [CategoryBudgetsService],
})
export class CategoryBudgetsModule {}
