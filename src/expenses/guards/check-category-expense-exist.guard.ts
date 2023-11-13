import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryExpensesService } from 'src/category-expenses';
import { ExpenseException } from '../enums';

@Injectable()
export class CheckCategoryExpenseExistGuard implements CanActivate {
	constructor(
		private readonly categoryExpensesService: CategoryExpensesService, //
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const { id } = request.params;
		const categoryExpense = await this.categoryExpensesService.findOne(
			{ id },
			{ monthlyExpense: true, category: true }, // 월별 지출, 카테고리 join
		);
		if (!categoryExpense) {
			throw new NotFoundException(ExpenseException.NOT_FOUND);
		}

		// 요청 객체에 categoryExpense 프로퍼티 추가
		request.categoryExpense = categoryExpense;

		return true;
	}
}
