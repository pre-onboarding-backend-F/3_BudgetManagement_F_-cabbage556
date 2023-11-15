import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, GetExpensesQueryDto, UpdateExpenseDto } from './dto';
import { GetUser, ResponseMessage } from 'src/global';
import { User } from 'src/users';
import { ExpenseResponse } from './enums';
import { AccessTokenGuard } from 'src/auth';
import { InvalidParseUUIDPipe } from './pipes';
import { GetExpensesQueryDtoPipe } from './pipes/get-expenses-query-dto.pipe';

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

	@Delete(':id')
	@ResponseMessage(ExpenseResponse.DELETE_EXPENSE)
	async deleteExpense(
		@Param('id', InvalidParseUUIDPipe) id: string, //
		@GetUser() user: User,
	) {
		return await this.expensesService.deleteExpense(id, user);
	}

	@Get()
	@ResponseMessage(ExpenseResponse.GET_EXPENSES)
	async getExpenses(
		@Query(GetExpensesQueryDtoPipe) getExpensesQueryDto: GetExpensesQueryDto, //
		@GetUser() user: User,
	) {
		return await this.expensesService.getExpenses(getExpensesQueryDto, user);
	}

	@Get(':id')
	@ResponseMessage(ExpenseResponse.GET_EXPENSE)
	async getExpense(
		@Param('id', InvalidParseUUIDPipe) id: string, //
		@GetUser() user: User,
	) {
		return await this.expensesService.getExpense(id, user);
	}
}
