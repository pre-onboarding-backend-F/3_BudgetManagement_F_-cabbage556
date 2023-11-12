import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export function IsValidAmount() {
	return applyDecorators(
		IsNotEmpty({ message: '$property 필드는 필수 입력 필드입니다.' }),
		IsInt({ message: '$property 필드에 정수를 입력해야 합니다.' }),
		Min(0, { message: '$property 필드에 0 이상의 정수를 입력해야 합니다.' }),
	);
}
