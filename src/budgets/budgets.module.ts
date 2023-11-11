import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Budget } from './entity';

@Module({
	imports: [TypeOrmModule.forFeature([Budget])],
	controllers: [BudgetsController],
	providers: [BudgetsService],
})
export class BudgetsModule {}
