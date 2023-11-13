import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto';
import { GetUser, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { ExpenseResponse } from './enums';
import { AccessTokenGuard } from 'src/auth';

@Controller('expenses')
@UseGuards(AccessTokenGuard)
export class ExpensesController {
	constructor(
		private readonly expensesService: ExpensesService, //
	) {}

	@Post()
	@ResponseMessage(ExpenseResponse.CREATE_EXPENSE)
	async createExpense(
		@Body() createExpenseDto: CreateExpenseDto, //
		@GetUser() user: User,
	) {
		return await this.expensesService.createExpense(createExpenseDto, user);
	}
}
