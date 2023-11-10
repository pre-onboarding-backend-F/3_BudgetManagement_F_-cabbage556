import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty({ message: 'account 필드는 필수 입력 필드입니다.' })
	@IsString({ message: 'account 필드에 문자열을 입력해야 합니다.' })
	account: string;

	@IsNotEmpty({ message: 'password 필드는 필수 입력 필드입니다.' })
	@IsString({ message: 'password 필드에 문자열을 입력해야 합니다.' })
	@Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,16}$/, {
		message:
			'패스워드는 8~16자리이며 최소 하나 이상의 영문자, 최소 하나 이상의 숫자, 최소 하나 이상의 특수문자를 입력해야 합니다.',
	})
	password: string;
}
