import { Module } from '@nestjs/common';
import { CategoryBudgetsService } from './category-budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryBudget } from './entity';

@Module({
	imports: [TypeOrmModule.forFeature([CategoryBudget])],
	providers: [CategoryBudgetsService],
})
export class CategoryBudgetsModule {}
