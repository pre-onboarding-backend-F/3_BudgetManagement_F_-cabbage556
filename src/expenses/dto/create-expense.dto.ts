import { IsBoolean, IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsValidAmount, IsValidYYYYMMDDFormat } from 'src/global';
import { IsValidCategoryString } from '../classes';
import { Transform } from 'class-transformer';

export class CreateExpenseDto {
	@IsValidYYYYMMDDFormat('yyyy_mm_dd')
	yyyyMMDD: string;

	@IsNotEmpty({ message: '$property 필드는 필수 입력 필드입니다.' })
	@Validate(IsValidCategoryString)
	category: string;

	@IsValidAmount('amount')
	amount: number;

	@IsNotEmpty({ message: '$property 필드는 필수 입력 필드입니다.' })
	@IsString({ message: '$property 필드에 문자열을 입력해야 합니다.' })
	memo: string;

	@IsNotEmpty({ message: '$property 필드는 필수 입력 필드입니다.' })
	@IsBoolean({ message: '$property 필드에 불리언 값을 입력해야 합니다.' })
	@Transform(({ value }) => value === true)
	exclude: boolean;
}
