import { IsValidAmount, IsValidYYYYMMDDFormat } from 'src/global';
import { IsValidCategoryString } from '../classes';
import { IsOptional, Validate } from 'class-validator';
import { Type } from 'class-transformer';

export class GetExpensesQueryDto {
	@IsValidYYYYMMDDFormat('start_date')
	startDate: string;

	@IsValidYYYYMMDDFormat('end_date')
	endDate: string;

	@IsOptional()
	@Validate(IsValidCategoryString)
	category: string;

	@IsValidAmount('min_amount', false)
	@Type(() => Number)
	minAmount: number;

	@IsValidAmount('max_amount', false)
	@Type(() => Number)
	maxAmount: number;
}
