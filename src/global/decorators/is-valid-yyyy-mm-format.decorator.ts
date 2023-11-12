import { applyDecorators } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsNotEmpty, ValidationOptions, registerDecorator } from 'class-validator';

export function IsOnlyYYYYMM(validationOptions?: ValidationOptions) {
	return function (object: Record<string, any>, propertyName: string) {
		registerDecorator({
			name: 'isOnlyYYYYMM',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [],
			options: {
				message: 'yyyy_mm 필드에 2020-12 형식의 년도와 월을 입력해야 합니다.',
				...validationOptions,
			},
			validator: {
				validate(value: any) {
					const regex = /^\d{4}(-)(((0)[0-9])|((1)[0-2]))$/;
					// return typeof value === 'string' && regex.test(value);
					return typeof value === 'string' && regex.test(value);
				},
			},
		});
	};
}

export function IsValidYYYYMMFormat() {
	return applyDecorators(
		Expose({ name: 'yyyy_mm' }),
		IsNotEmpty({ message: 'yyyy_mm 필드는 필수 입력 필드입니다.' }),
		IsOnlyYYYYMM(),
	);
}
