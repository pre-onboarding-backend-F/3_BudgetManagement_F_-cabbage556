import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateUserDto } from '../dto';
import { UsersService } from '../users.service';
import { UserException } from '../enums';

@Injectable()
export class CheckAccountPipe implements PipeTransform {
	constructor(
		private readonly usersSerivce: UsersService, //
	) {}

	async transform(value: CreateUserDto) {
		const { username } = value;
		const userExist = await this.usersSerivce.isUserExist({ username });
		if (userExist) {
			throw new ConflictException(UserException.ACCOUNT_ALREADY_EXISTS);
		}

		return value;
	}
}
