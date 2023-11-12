import { Module } from '@nestjs/common';
import { CategoryExpensesService } from './category-expenses.service';

@Module({
	providers: [CategoryExpensesService],
	exports: [CategoryExpensesService],
})
export class CategoryExpensesModule {}
