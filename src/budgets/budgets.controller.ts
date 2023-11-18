import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { GetBudgetRecommendQueryDto, SetBudgetDto } from './dto';
import { AccessTokenGuard } from 'src/auth';
import { GetUser, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { BudgetResponse } from './enums';

@Controller('budgets')
@UseGuards(AccessTokenGuard)
export class BudgetsController {
	constructor(
		private readonly budgetsService: BudgetsService, //
	) {}

	@Put()
	@ResponseMessage(BudgetResponse.SET_BUDGET)
	async setBudget(
		@Body() setBudgetDto: SetBudgetDto, //
		@GetUser() user: User,
	) {
		return await this.budgetsService.setBudget(setBudgetDto, user);
	}

	@Get('recommend')
	@ResponseMessage(BudgetResponse.GET_BUDGET_RECOMMEND)
	async getBudgetRecommend(
		@Query() dto: GetBudgetRecommendQueryDto, //
	) {
		return await this.budgetsService.getBudgetRecommend(dto);
	}
}
