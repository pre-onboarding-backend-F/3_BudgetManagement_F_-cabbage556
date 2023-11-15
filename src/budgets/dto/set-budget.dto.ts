import { IsValidAmount, IsValidYYYYMMFormat } from 'src/global';

export class SetBudgetDto {
	@IsValidYYYYMMFormat()
	yyyyMM: string;

	@IsValidAmount('food')
	food: number;

	@IsValidAmount('cafe')
	cafe: number;

	@IsValidAmount('transport')
	transport: number;

	@IsValidAmount('living')
	living: number;

	@IsValidAmount('shop')
	shop: number;

	@IsValidAmount('hobby')
	hobby: number;

	@IsValidAmount('health')
	health: number;

	@IsValidAmount('culture')
	culture: number;
}
