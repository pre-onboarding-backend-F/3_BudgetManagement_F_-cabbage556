import { Type } from 'class-transformer';
import { IsValidAmount } from 'src/global';

export class GetBudgetRecommendQueryDto {
	@IsValidAmount('total_amount')
	@Type(() => Number)
	totalAmount: number;
}
