import { Module } from '@nestjs/common';
import { MonthlyExpensesService } from './monthly-expenses.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlyExpense } from './entity';

@Module({
	imports: [TypeOrmModule.forFeature([MonthlyExpense])],
	providers: [MonthlyExpensesService],
	exports: [MonthlyExpensesService],
})
export class MonthlyExpensesModule {}
