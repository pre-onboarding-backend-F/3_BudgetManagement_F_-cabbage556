import { IsValidAmount, IsValidYYYYMMFormat } from 'src/global';

export class SetBudgetDto {
	@IsValidYYYYMMFormat()
	yyyyMM: string;

	@IsValidAmount()
	food: number;

	@IsValidAmount()
	cafe: number;

	@IsValidAmount()
	transport: number;

	@IsValidAmount()
	living: number;

	@IsValidAmount()
	shop: number;

	@IsValidAmount()
	hobby: number;

	@IsValidAmount()
	health: number;

	@IsValidAmount()
	culture: number;
}
