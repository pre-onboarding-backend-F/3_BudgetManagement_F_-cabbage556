import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto';
import { GetUser, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { ExpenseResponse } from './enums';
import { AccessTokenGuard } from 'src/auth';
import { InvalidParseUUIDPipe } from './pipes';

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

	@Patch(':id')
	@ResponseMessage(ExpenseResponse.UPDATE_EXPENSE)
	async updateExpense(
		@Param('id', InvalidParseUUIDPipe) id: string,
		@Body() updateExpenseDto: UpdateExpenseDto,
		@GetUser() user: User,
	) {
		return await this.expensesService.updateExpense(id, updateExpenseDto, user);
	}
}
