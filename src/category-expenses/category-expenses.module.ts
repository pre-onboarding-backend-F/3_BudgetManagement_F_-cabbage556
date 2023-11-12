import { Module } from '@nestjs/common';
import { CategoryExpensesService } from './category-expenses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryExpense } from './entity';

@Module({
	imports: [TypeOrmModule.forFeature([CategoryExpense])],
	providers: [CategoryExpensesService],
	exports: [CategoryExpensesService],
})
export class CategoryExpensesModule {}
