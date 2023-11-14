import { applyDecorators } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export function IsValidAmount(exposePropertyName = '$property', isNotEmpty = true) {
	return applyDecorators(
		isNotEmpty ? IsNotEmpty({ message: `${exposePropertyName} 필드는 필수 입력 필드입니다.` }) : IsOptional(),
		IsInt({ message: `${exposePropertyName} 필드에 정수를 입력해야 합니다.` }),
		Min(0, { message: `${exposePropertyName} 필드에 0 이상의 정수를 입력해야 합니다.` }),
	);
}
