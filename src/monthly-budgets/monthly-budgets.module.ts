import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyBudgetsService } from './monthly-budgets.service';
import { MonthlyBudget } from './entity';

@Module({
	imports: [TypeOrmModule.forFeature([MonthlyBudget])],
	providers: [MonthlyBudgetsService],
	exports: [MonthlyBudgetsService],
})
export class MonthlyBudgetsModule {}
