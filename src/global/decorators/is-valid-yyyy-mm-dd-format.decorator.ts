import { applyDecorators } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsNotEmpty, ValidationOptions, registerDecorator } from 'class-validator';

export function IsOnlyYYYYMMDD(validationOptions?: ValidationOptions) {
	return function (object: Record<string, any>, propertyName: string) {
		registerDecorator({
			name: 'isOnlyYYYYMMDD',
			target: object.constructor,
			propertyName: propertyName,
			constraints: [],
			options: {
				...validationOptions,
			},
			validator: {
				validate(value: any) {
					const regex = /^\d{4}(-)(((0)[0-9])|((1)[0-2]))(-)([0-2][0-9]|(3)[0-1])$/;
					return typeof value === 'string' && regex.test(value);
				},
			},
		});
	};
}

export function IsValidYYYYMMDDFormat(exposePropertyName: string) {
	return applyDecorators(
		Expose({ name: exposePropertyName }),
		IsNotEmpty({ message: `${exposePropertyName} 필드는 필수 입력 필드입니다.` }),
		IsOnlyYYYYMMDD({ message: `${exposePropertyName} 필드에 2020-12-30 형식의 년도, 월, 일을 입력해야 합니다.` }),
	);
}
